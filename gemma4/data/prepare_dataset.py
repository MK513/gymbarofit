"""
Gym Members Exercise Dataset → Instruction Dataset (JSONL) 변환 스크립트

입력 : data/gym_members_exercise_tracking.csv
출력 : data/dataset_config.json         (공통 instruction — 단 한 번만 저장)
       data/instruction_dataset.jsonl   (전체: input + output만)
       data/train.jsonl                 (80%: input + output만)
       data/val.jsonl                   (20%: input + output만)

공통 instruction은 dataset_config.json에서 한 번만 관리합니다.
학습 시 dataset_config.json을 읽어 instruction을 주입하세요.
"""

import csv
import json
import random
import os
from pathlib import Path

# ── 경로 설정 ──────────────────────────────────────────────────────────────
BASE_DIR  = Path(__file__).parent
CSV_PATH  = BASE_DIR / "gym_members_exercise_tracking.csv"
OUT_CONFIG = BASE_DIR / "dataset_config.json"
OUT_ALL    = BASE_DIR / "instruction_dataset.jsonl"
OUT_TRAIN  = BASE_DIR / "train.jsonl"
OUT_VAL    = BASE_DIR / "val.jsonl"

# 모든 레코드에서 공통으로 쓰이는 instruction — dataset_config.json에 한 번만 저장
SHARED_INSTRUCTION = (
    "당신은 전문 퍼스널 트레이너입니다. "
    "아래 회원의 운동 기록을 분석하고, "
    "전문적인 피드백과 다음 운동 추천을 제공하세요."
)

SEED        = 42
TRAIN_RATIO = 0.8

# ── 상수 매핑 ──────────────────────────────────────────────────────────────
WORKOUT_TYPE_KO = {
    "Cardio":   "유산소",
    "HIIT":     "고강도 인터벌(HIIT)",
    "Strength": "근력",
    "Yoga":     "요가",
}

EXPERIENCE_KO = {
    "1": "초급",
    "2": "중급",
    "3": "고급",
}

GENDER_KO = {"Male": "남성", "Female": "여성"}

# ── 헬퍼 ──────────────────────────────────────────────────────────────────

def bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "저체중"
    elif bmi < 23.0:
        return "정상"
    elif bmi < 25.0:
        return "과체중"
    elif bmi < 30.0:
        return "비만 1단계"
    else:
        return "비만 2단계"


def heart_rate_zone(avg_bpm: float, max_bpm: float) -> str:
    """평균 심박수가 최대 심박수의 몇 %인지로 운동 강도 구간 판단."""
    ratio = avg_bpm / max_bpm if max_bpm > 0 else 0
    if ratio < 0.60:
        return "저강도(회복)"
    elif ratio < 0.70:
        return "지방 연소"
    elif ratio < 0.80:
        return "유산소(심폐)"
    elif ratio < 0.90:
        return "무산소 임계"
    else:
        return "최대 운동"


def calorie_per_hour(calories: float, duration: float) -> float:
    return round(calories / duration, 1) if duration > 0 else 0.0


def water_advice(water_liters: float, duration: float) -> str:
    recommended = round(duration * 0.5 + 1.5, 1)   # 기본 1.5L + 운동 0.5L/h
    if water_liters < recommended * 0.8:
        return f"수분 섭취({water_liters}L)가 권장량({recommended}L)보다 부족합니다. 운동 전·중·후 충분히 섭취하세요."
    elif water_liters > recommended * 1.3:
        return f"수분 섭취({water_liters}L)가 충분합니다."
    else:
        return f"수분 섭취({water_liters}L)가 적절합니다."


def fat_advice(fat_pct: float, gender: str) -> str:
    # 성별별 건강 체지방률 범위
    healthy = (10, 20) if gender == "Male" else (18, 28)
    if fat_pct < healthy[0]:
        return f"체지방률({fat_pct}%)이 낮습니다. 영양 섭취에 주의하세요."
    elif fat_pct > healthy[1]:
        return f"체지방률({fat_pct}%)이 높습니다. 유산소 운동 비중을 늘리는 것이 좋습니다."
    else:
        return f"체지방률({fat_pct}%)이 건강한 범위에 있습니다."


def next_workout_recommendation(
    workout_type: str,
    experience: str,
    fat_pct: float,
    avg_bpm: float,
    max_bpm: float,
    gender: str,
) -> str:
    """운동 유형·경험치·체지방률을 종합해 다음 운동을 추천."""
    zone = heart_rate_zone(avg_bpm, max_bpm)
    fat_high = fat_pct > (20 if gender == "Male" else 28)
    fat_low  = fat_pct < (10 if gender == "Male" else 18)

    recommendations = []

    if workout_type == "Cardio":
        if experience == "1":
            recommendations.append("다음 세션에는 30분 이상 저강도 유산소(걷기·자전거)를 유지하세요.")
        elif experience == "2":
            recommendations.append("인터벌 달리기(1분 전력·2분 회복 × 6세트)를 추가해 심폐 능력을 향상시키세요.")
        else:
            recommendations.append("장거리 달리기(5km 이상) 또는 사이클링으로 지구력을 강화하세요.")
        if fat_high:
            recommendations.append("체지방 감량을 위해 HIIT를 주 1~2회 병행하는 것을 추천합니다.")

    elif workout_type == "HIIT":
        recommendations.append("HIIT 후 근육 회복을 위해 48시간 휴식을 권장합니다.")
        if experience == "1":
            recommendations.append("다음 세션은 저강도 유산소나 요가로 활동적 회복을 진행하세요.")
        else:
            recommendations.append("다음 HIIT 세션에서는 운동 밀도(세트 수 또는 휴식 감소)를 5~10% 높여 점진적 과부하를 적용하세요.")

    elif workout_type == "Strength":
        if experience == "1":
            recommendations.append("다음 세션에는 스쿼트·데드리프트·벤치프레스 3대 운동을 중심으로 12~15회 × 3세트를 수행하세요.")
        elif experience == "2":
            recommendations.append("복합 운동(컴파운드)의 무게를 5% 증량하거나 세트 수를 1세트 추가해 점진적 과부하를 적용하세요.")
        else:
            recommendations.append("주기화(선형 또는 파동형) 훈련 프로그램을 적용해 고원 현상을 극복하세요.")
        if fat_high:
            recommendations.append("유산소 운동을 세션 후 20분 추가해 체지방 감량을 병행하세요.")

    elif workout_type == "Yoga":
        recommendations.append("요가 후 폼롤러로 근막 이완을 진행하면 유연성 향상에 도움이 됩니다.")
        if experience == "1":
            recommendations.append("다음 세션은 Hatha Yoga 기본 자세 위주로 10분씩 호흡을 집중하세요.")
        else:
            recommendations.append("Power Yoga 또는 Vinyasa Flow로 강도를 높여 심폐 기능도 함께 강화하세요.")
        if fat_low:
            recommendations.append("근력 유지를 위해 주 2회 기초 근력 운동을 병행하는 것을 권장합니다.")

    if zone in ("무산소 임계", "최대 운동"):
        recommendations.append(f"이번 세션 심박수 구간이 '{zone}'으로 매우 높았습니다. 다음 세션은 강도를 10~15% 낮춰 과훈련을 예방하세요.")
    elif zone == "저강도(회복)":
        recommendations.append("심박수가 낮아 운동 효과가 제한적일 수 있습니다. 다음 세션에서는 강도를 조금 높여보세요.")

    return " ".join(recommendations) if recommendations else "현재 운동 패턴을 유지하면서 꾸준히 지속하세요."


# ── 행(row) → instruction dict ──────────────────────────────────────────────

def row_to_instruction(row: dict) -> dict:
    age        = row["Age"]
    gender_en  = row["Gender"]
    gender     = GENDER_KO.get(gender_en, gender_en)
    weight     = float(row["Weight (kg)"])
    height     = float(row["Height (m)"])
    max_bpm    = float(row["Max_BPM"])
    avg_bpm    = float(row["Avg_BPM"])
    rest_bpm   = float(row["Resting_BPM"])
    duration   = float(row["Session_Duration (hours)"])
    calories   = float(row["Calories_Burned"])
    w_type_en  = row["Workout_Type"]
    w_type     = WORKOUT_TYPE_KO.get(w_type_en, w_type_en)
    fat_pct    = float(row["Fat_Percentage"])
    water      = float(row["Water_Intake (liters)"])
    freq       = row["Workout_Frequency (days/week)"]
    exp_en     = row["Experience_Level"]
    exp        = EXPERIENCE_KO.get(str(exp_en), str(exp_en))
    bmi        = float(row["BMI"])

    bmi_cat    = bmi_category(bmi)
    zone       = heart_rate_zone(avg_bpm, max_bpm)
    cph        = calorie_per_hour(calories, duration)
    water_msg  = water_advice(water, duration)
    fat_msg    = fat_advice(fat_pct, gender_en)
    next_rec   = next_workout_recommendation(
                    w_type_en, str(exp_en), fat_pct, avg_bpm, max_bpm, gender_en
                 )

    # ── input ──
    inp = (
        f"나이: {age}세 | 성별: {gender} | "
        f"체중: {weight}kg | 키: {height}m | BMI: {bmi}({bmi_cat})\n"
        f"체지방률: {fat_pct}% | 안정시 심박수: {rest_bpm}bpm\n"
        f"운동 유형: {w_type} | 경험 수준: {exp} | 주 {freq}회 운동\n"
        f"이번 세션: {duration}시간 | 평균 심박수: {avg_bpm}bpm | "
        f"최대 심박수: {max_bpm}bpm\n"
        f"소모 칼로리: {calories}kcal | 수분 섭취: {water}L"
    )

    # ── output ──
    output = (
        f"## 운동 기록 분석\n\n"
        f"**신체 지표**: BMI {bmi}로 {bmi_cat} 범주에 해당합니다. {fat_msg}\n\n"
        f"**이번 세션 강도**: 평균 심박수 {avg_bpm}bpm은 최대 심박수 대비 "
        f"'{zone}' 구간으로, {duration}시간 동안 총 {calories}kcal를 소모했습니다. "
        f"(시간당 {cph}kcal)\n\n"
        f"**수분 관리**: {water_msg}\n\n"
        f"## 다음 운동 추천\n\n"
        f"{next_rec}"
    )

    return {"input": inp, "output": output}


# ── 메인 ──────────────────────────────────────────────────────────────────

def main():
    random.seed(SEED)

    # 공통 instruction을 dataset_config.json에 저장
    config = {"instruction": SHARED_INSTRUCTION}
    with open(OUT_CONFIG, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    print(f"[INFO] 공통 instruction 저장: {OUT_CONFIG}")

    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        records = [row_to_instruction(row) for row in reader]

    print(f"[INFO] 총 {len(records)}건 변환 완료")

    # 전체 저장 (input + output만)
    with open(OUT_ALL, "w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(f"[INFO] 전체 데이터 저장: {OUT_ALL}")

    # train / val 분리
    random.shuffle(records)
    split = int(len(records) * TRAIN_RATIO)
    train_records = records[:split]
    val_records   = records[split:]

    with open(OUT_TRAIN, "w", encoding="utf-8") as f:
        for rec in train_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    with open(OUT_VAL, "w", encoding="utf-8") as f:
        for rec in val_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print(f"[INFO] Train: {len(train_records)}건 → {OUT_TRAIN}")
    print(f"[INFO] Val  : {len(val_records)}건 → {OUT_VAL}")

    # 샘플 출력
    print("\n── 샘플 레코드 ──────────────────────────────────────────")
    sample = records[0]
    print(f"[instruction (dataset_config.json)]\n{SHARED_INSTRUCTION}\n")
    print(f"[input]\n{sample['input']}\n")
    print(f"[output]\n{sample['output']}\n")


if __name__ == "__main__":
    main()
