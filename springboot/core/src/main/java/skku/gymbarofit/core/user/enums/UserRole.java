package skku.gymbarofit.core.user.enums;

public enum UserRole {

    MEMBER("MEMBER"),
    OWNER("OWNER");

    private final String role;

    UserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
