package com.linkit.domain.webpush;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

public class PushSubscriptionDto {

    @Getter @Setter
    public static class RegisterRequest {
        @NotBlank private String endpoint;
        @NotBlank private String p256dh;
        @NotBlank private String auth;
    }

    @Getter @Setter
    public static class UnregisterRequest {
        @NotBlank private String endpoint;
    }

    /** 프론트의 PushSubscription.toJSON() 구조 직접 수신용 */
    @Getter @Setter
    public static class BrowserSubscription {
        @NotBlank private String endpoint;
        private Keys keys;

        @Getter @Setter
        public static class Keys {
            @NotBlank private String p256dh;
            @NotBlank private String auth;
        }
    }
}
