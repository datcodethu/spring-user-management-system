package com.example.usermanagement.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDto> findAll() {
        return userRepository.findAll()
                .stream()
                .map(UserDto::from)
                .toList();
    }

    public UserDto findById(Long id) {
        return UserDto.from(findUser(id));
    }

    public UserDto create(UserCreateRequest request) {
        ensureEmailIsAvailable(request.email());

        Role role = request.role() == null ? Role.USER : request.role();
        AppUser user = new AppUser(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                role
        );

        return UserDto.from(userRepository.save(user));
    }

    public UserDto update(Long id, UserUpdateRequest request) {
        AppUser user = findUser(id);

        userRepository.findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
                });

        user.setName(request.name());
        user.setEmail(request.email());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        user.setRole(request.role() == null ? Role.USER : request.role());

        return UserDto.from(userRepository.save(user));
    }

    public void delete(Long id) {
        AppUser user = findUser(id);
        userRepository.delete(user);
    }

    private void ensureEmailIsAvailable(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
    }

    private AppUser findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
