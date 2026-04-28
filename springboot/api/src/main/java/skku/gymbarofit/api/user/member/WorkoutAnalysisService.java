package skku.gymbarofit.api.user.member;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import skku.gymbarofit.core.usage.equipment.dto.DailyWorkoutGroupDto;
import skku.gymbarofit.core.usage.equipment.dto.WorkoutHistoryResponseDto;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkoutAnalysisService {

    private final MemberService memberService;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.fastapi.base-url}")
    private String fastapiBaseUrl;

    private static final long SSE_TIMEOUT_MS = 5 * 60 * 1000L;

    public SseEmitter streamAnalysis(Long memberId, int year, int month) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        SecurityContext securityContext = SecurityContextHolder.getContext();

        Thread.ofVirtual().name("workout-analysis-" + memberId).start(() -> {
            SecurityContextHolder.setContext(securityContext);
            try {
                WorkoutHistoryResponseDto history =
                        memberService.getWorkoutHistory(memberId, year, month);
                String inputText = formatInputText(history, year, month);
                streamFromFastApi(inputText, emitter);
            } catch (Exception e) {
                log.error("[workout-analysis] error for memberId={}", memberId, e);
                sendErrorAndComplete(emitter, "분석 중 오류가 발생했습니다.");
            } finally {
                SecurityContextHolder.clearContext();
            }
        });

        return emitter;
    }

    private void streamFromFastApi(String inputText, SseEmitter emitter) {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .version(java.net.http.HttpClient.Version.HTTP_1_1)
                .build();

        String body;
        try {
            body = objectMapper.writeValueAsString(
                    Map.of("input_text", inputText, "retrieved_context", ""));
        } catch (Exception e) {
            sendErrorAndComplete(emitter, "요청 직렬화에 실패했습니다.");
            return;
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(fastapiBaseUrl + "/analyze"))
                .header("Content-Type", "application/json")
                .header("Accept", "text/event-stream")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            HttpResponse<java.io.InputStream> response =
                    client.send(request, HttpResponse.BodyHandlers.ofInputStream());

            if (response.statusCode() == 503) {
                sendErrorAndComplete(emitter, "AI 모델이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
                return;
            }
            if (response.statusCode() != 200) {
                sendErrorAndComplete(emitter, "AI 서비스 오류가 발생했습니다. (HTTP " + response.statusCode() + ")");
                return;
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("data:")) continue;
                    String payload = line.substring(5).strip();

                    if ("[DONE]".equals(payload)) {
                        emitter.send(SseEmitter.event().name("done").data(""));
                        emitter.complete();
                        return;
                    }

                    try {
                        JsonNode node = objectMapper.readTree(payload);
                        if (node.has("error")) {
                            sendErrorAndComplete(emitter, "AI 분석 중 오류가 발생했습니다.");
                            return;
                        }
                        if (node.has("token")) {
                            emitter.send(SseEmitter.event()
                                    .name("token")
                                    .data(node.get("token").asText()));
                        }
                    } catch (Exception ignored) {}
                }
            }
            emitter.complete();

        } catch (java.net.ConnectException e) {
            log.warn("[workout-analysis] FastAPI unreachable at {}: {}", fastapiBaseUrl, e.getMessage());
            sendErrorAndComplete(emitter, "AI 서비스에 연결할 수 없습니다.");
        } catch (Exception e) {
            log.error("[workout-analysis] streaming error", e);
            sendErrorAndComplete(emitter, "AI 스트리밍 중 오류가 발생했습니다.");
        }
    }

    String formatInputText(WorkoutHistoryResponseDto dto, int year, int month) {
        StringBuilder sb = new StringBuilder();
        sb.append("[운동 기록 분석 요청]\n");
        sb.append(String.format("기간: %d년 %d월%n", year, month));
        sb.append(String.format("운동한 날: %d일%n", dto.totalDays()));
        sb.append(String.format("총 운동 시간: %d분%n", dto.totalUsageMinutes()));
        sb.append(String.format("총 소모 칼로리: %.1f kcal%n", dto.totalCalories()));

        if (dto.dailyRecords() != null && !dto.dailyRecords().isEmpty()) {
            sb.append("\n[일별 운동 상세]\n");
            for (DailyWorkoutGroupDto day : dto.dailyRecords()) {
                sb.append(String.format("- %d월 %d일: ", month, day.day()));
                if (day.workouts() != null && !day.workouts().isEmpty()) {
                    var texts = day.workouts().stream()
                            .map(w -> String.format("%s %d분 (%.1f kcal, %s)",
                                    w.title(), w.minutes(), w.calories(), localizeType(w.type())))
                            .toList();
                    sb.append(String.join(", ", texts));
                }
                sb.append("\n");
            }
        } else {
            sb.append("\n이번 달 운동 기록이 없습니다.\n");
        }

        sb.append("\n위 운동 기록을 바탕으로 회원에게 맞춤형 피드백과 개선 방안을 한국어로 알려주세요.");
        return sb.toString();
    }

    private String localizeType(String type) {
        if (type == null) return "기타";
        return switch (type.toUpperCase()) {
            case "CARDIO"   -> "유산소";
            case "STRENGTH" -> "근력";
            case "STRETCH"  -> "스트레칭";
            default         -> type;
        };
    }

    private void sendErrorAndComplete(SseEmitter emitter, String message) {
        try {
            emitter.send(SseEmitter.event().name("error").data(message));
            emitter.complete();
        } catch (Exception ex) {
            emitter.completeWithError(ex);
        }
    }
}
