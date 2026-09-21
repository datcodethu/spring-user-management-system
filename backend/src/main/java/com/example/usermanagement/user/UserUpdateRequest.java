package com.example.usermanagement.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @NotBlank @Size(max = 80) String name,
        @Email @NotBlank String email,
        @Size(min = 6) String password,
        Role role
) {
}
