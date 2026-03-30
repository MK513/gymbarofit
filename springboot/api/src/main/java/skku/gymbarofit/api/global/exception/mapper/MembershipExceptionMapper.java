package skku.gymbarofit.api.global.exception.mapper;

import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.GlobalErrorCode;
import skku.gymbarofit.core.global.exception.GlobalException;
import skku.gymbarofit.core.membership.exceptions.MembershipErrorCode;
import skku.gymbarofit.core.membership.exceptions.MembershipException;

public class MembershipExceptionMapper {

    private static BusinessException unknown() {
        return new GlobalException(GlobalErrorCode.UNKNOWN_ERROR);
    }

    public static BusinessException map(String constraintName) {
        if (constraintName == null || constraintName.isBlank()) return unknown();

        if (constraintName.contains("uk_membership_member_gym")) {
            return new MembershipException(MembershipErrorCode.MEMBERSHIP_ALREADY_EXISTS);
        }

        return unknown();
    }
}
