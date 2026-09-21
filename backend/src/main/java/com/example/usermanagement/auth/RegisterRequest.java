package com.example.usermanagement.auth;

import com.example.usermanagement.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 80) String name,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password,
        Role role
) {
}
