package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EmpBackendApplicationTests {

	@Test
	void contextLoads() {
		// Test that the application context loads successfully with H2 database
	}

}
