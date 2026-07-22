package com.example.auth.controller;

import com.example.auth.enums.DayOfWeek;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/master")
public class MasterController {

    @GetMapping("/days")
    public ResponseEntity<DayOfWeek[]> getDays() {
        return ResponseEntity.ok(DayOfWeek.values());
    }
}