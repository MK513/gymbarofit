package skku.gymbarofit.core.item.locker.enums;

public enum LockerPlan {

    MONTH_3(3),
    MONTH_5(5),
    MONTH_7(7);

    private final int months;

    LockerPlan(int months) {
        this.months = months;
    }

    public int getMonths() {
        return months;
    }
}