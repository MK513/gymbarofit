package skku.gymbarofit.core.global.enums;

public enum UserRole {

    ROLE_MEMBER("MEMBER"),
    ROLE_OWNER("OWNER");

    private final String role;

    UserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
