package skku.gymbarofit.core.gym.enums;

import lombok.Getter;

@Getter
public enum GymCrowdLevel {

    VERY_COMFORTABLE(0, 30, "매우 쾌적"),
    COMFORTABLE(31, 50, "쾌적"),
    NORMAL(51, 70, "보통"),
    CROWDED(71, 90, "혼잡"),
    VERY_CROWDED(91, 100, "매우 혼잡");

    private final int minPercent;
    private final int maxPercent;
    private final String description;

    GymCrowdLevel(int minPercent, int maxPercent, String description) {
        this.minPercent = minPercent;
        this.maxPercent = maxPercent;
        this.description = description;
    }

    public static GymCrowdLevel from(int percent) {
        for (GymCrowdLevel level : values()) {
            if (percent >= level.minPercent && percent <= level.maxPercent) {
                return level;
            }
        }
        throw new IllegalArgumentException("Invalid crowd percent: " + percent);
    }
}
