package com.curearly.auth;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
public final class AuthRequests {
    private AuthRequests() { }
    public record Register(@NotBlank @Size(max=80) String fullName, @NotBlank @Email String email, @NotBlank @Pattern(regexp="^[0-9+() -]{7,20}$") String phone, @NotBlank @Size(min=12, max=72) String password) { }
    public record Login(@NotBlank @Email String email, @NotBlank String password) { }
    public record AuthenticatedUser(String id, String fullName, String email) { }
}
