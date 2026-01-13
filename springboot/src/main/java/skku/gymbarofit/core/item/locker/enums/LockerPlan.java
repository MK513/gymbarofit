package skku.gymbarofit.core.item.locker.enums;

import lombok.Getter;

@Getter
public enum LockerPlan {

    // TODO 나중에 테이블로 업그레이드??

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