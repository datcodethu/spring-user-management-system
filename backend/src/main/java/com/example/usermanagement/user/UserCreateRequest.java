package com.example.usermanagement.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
        @NotBlank @Size(max = 80) String name,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password,
        Role role
) {
}
