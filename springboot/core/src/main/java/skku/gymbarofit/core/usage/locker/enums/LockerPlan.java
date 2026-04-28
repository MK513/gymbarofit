package skku.gymbarofit.core.usage.locker.enums;

import lombok.Getter;

@Getter
public enum LockerPlan {

    MONTH_1(1, 10000),
    MONTH_3(3, 27000),
    MONTH_6(6, 50000);

    private final int months;
    private final int amount;

    LockerPlan(int months, int amount) {
        this.months = months;
        this.amount = amount;
    }

}