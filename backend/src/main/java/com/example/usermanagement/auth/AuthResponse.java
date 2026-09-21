package com.example.usermanagement.auth;

import com.example.usermanagement.user.Role;

public record AuthResponse(
        String token,
        Long id,
        String name,
        String email,
        Role role
) {
}
