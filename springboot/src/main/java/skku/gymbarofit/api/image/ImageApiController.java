package skku.gymbarofit.api.image;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import skku.gymbarofit.core.item.enums.EquipmentType;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/equipment-icons")
public class ImageApiController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getEquipmentIcons() {
        File dir = new File(uploadDir);
        File[] files = dir.listFiles((d, name) ->
                name.toLowerCase().endsWith(".png") && !name.contains("_50.")
        );

        if (files == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Map<String, String>> icons = Arrays.stream(files)
                .sorted(Comparator.comparing(File::getName))
                .map(f -> Map.of(
                        "filename", f.getName(),
                        "url", "/images/" + URLEncoder.encode(f.getName(), StandardCharsets.UTF_8).replace("+", "%20"),
                        "type", EquipmentType.fromFilename(f.getName()).name()
                ))
                .toList();

        return ResponseEntity.ok(icons);
    }
}
