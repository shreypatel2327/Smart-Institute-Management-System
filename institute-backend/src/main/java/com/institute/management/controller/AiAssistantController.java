package com.institute.management.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    @Value("${gemini.api.key}")
    private String apiKey;

    @PostMapping("/generate")
    public ResponseEntity<?> generateContent(@RequestBody Map<String, String> payload) {
        String prompt = payload.getOrDefault("prompt", "web development").toLowerCase();
        String selectedType = payload.getOrDefault("type", "EVENT_FORM").toUpperCase(); // EVENT_FORM, REG_FORM,
                                                                                        // ANNOUNCEMENT, QUIZ,
                                                                                        // ASSIGNMENT, EXAM

        // Auto-detect type if prompt strongly implies a specific category
        String detectedType = selectedType;
        if (prompt.contains("form") || prompt.contains("fields") || prompt.contains("register")
                || prompt.contains("registration") || prompt.contains("sign up") || prompt.contains("input field")
                || prompt.contains("jain") || prompt.contains("regular") || prompt.contains("members")) {
            detectedType = "EVENT_FORM";
        } else if (prompt.contains("quiz") || prompt.contains("mcq") || prompt.contains("test")
                || prompt.contains("question")) {
            detectedType = "QUIZ";
        } else if (prompt.contains("announcement") || prompt.contains("announce") || prompt.contains("bulletin")
                || prompt.contains("notice")) {
            detectedType = "ANNOUNCEMENT";
        } else if (prompt.contains("assignment") || prompt.contains("homework") || prompt.contains("project task")) {
            detectedType = "ASSIGNMENT";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("prompt", prompt);
        response.put("type", detectedType);
        response.put("generatedAt", new Date());

        String generatedTitle = "";
        String generatedContentJson = "";

        // Try calling the active Gemini API
        boolean geminiSuccess = false;
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                String systemPrompt = "";
                if ("QUIZ".equals(detectedType)) {
                    systemPrompt = "You are a coaching institute professor. Generate a JSON array of exactly 3 MCQ questions for a quiz on the user's topic. Each question object in the array must contain exactly these properties:\n- 'question' (string): the question text\n- 'options' (array of strings): exactly 4 distinct options\n- 'correctIndex' (number): the 0-based index of the correct option\nDo not include any extra explanation or wrapper objects. Do NOT generate form fields. Just return the JSON array.";
                } else if ("EVENT_FORM".equals(detectedType) || "REG_FORM".equals(detectedType)) {
                    systemPrompt = "You are an event organizer. Generate a JSON array of form fields for a registration or event form based on the user's prompt. IMPORTANT: If the user lists specific fields (such as 'Name', 'How Many Members...', 'Food: Jain or Regular?'), you MUST convert exactly those fields into the form fields array. If no specific fields are mentioned, generate 3 or 4 relevant generic fields.\nEach field object in the JSON array must contain exactly these properties:\n- 'name' (string): unique camelCase identifier (e.g. 'fullName', 'memberCount', 'foodPreference')\n- 'label' (string): user-friendly label matching the field (e.g. 'Full Name', 'How Many Members Come In Event?', 'Food Preference')\n- 'type' (string): select one of: 'text', 'email', 'number', 'select', 'textarea'\n- 'required' (boolean): true or false\n- 'options' (array of strings, optional): only include if type is 'select' (e.g. for 'Food: Jain or Regular?', type is 'select' and options is ['Jain', 'Regular'])\nDo not include any extra explanation or wrapper objects. Do NOT generate quiz questions. Just return the JSON array.";
                } else if ("ASSIGNMENT".equals(detectedType)) {
                    systemPrompt = "You are a faculty member. Generate a JSON object for a student assignment on the user's topic. The JSON object must contain exactly these properties:\n- 'description' (string): assignment overview\n- 'suggestedDeadlineDays' (number): recommended completion timeframe\n- 'instructions' (string): submission instructions\nJust return the JSON object.";
                } else if ("EXAM".equals(detectedType)) {
                    systemPrompt = "You are an examiner. Generate a JSON object for a student exam on the user's topic. The JSON object must contain exactly these properties:\n- 'subject' (string): name of the subject\n- 'totalMarks' (number): e.g. 50\n- 'questions' (array of strings): list of 3 exam questions\nJust return the JSON object.";
                } else {
                    systemPrompt = "You are an administrator. Generate a JSON object for a general notice board announcement regarding the user's topic. The JSON object must contain exactly this property:\n- 'bulletin' (string): notice board message details\nJust return the JSON object.";
                }

                String rawGeminiOutput = callGemini(systemPrompt, prompt);
                generatedContentJson = normalizeGeminiJson(rawGeminiOutput, detectedType);
                generatedTitle = capitalize(detectedType.toLowerCase().replace("_", " ")) + " on " + capitalize(prompt);
                geminiSuccess = true;
            } catch (Exception e) {
                System.err.println(
                        "Active Gemini API call failed. Falling back to static templates. Reason: " + e.getMessage());
            }
        }

        // Static Template Fallback if Gemini failed or wasn't configured
        if (!geminiSuccess) {
            if ("QUIZ".equals(detectedType)) {
                generatedTitle = "AI Generated Quiz on: " + capitalize(prompt);
                generatedContentJson = "["
                        + "{\"question\":\"What is the primary concept of " + prompt
                        + "?\",\"options\":[\"Data structures\",\"Syntax optimization\",\"Core functionality principles\",\"User interfaces\"],\"correctIndex\":2},"
                        + "{\"question\":\"Which of the following is commonly used in " + prompt
                        + "?\",\"options\":[\"Compiler warnings\",\"Standard library modules\",\"Deprecated frameworks\",\"None of the above\"],\"correctIndex\":1},"
                        + "{\"question\":\"What is a key benefit of practicing " + prompt
                        + "?\",\"options\":[\"Slower execution times\",\"Higher complexity\",\"Enhanced logical thinking\",\"Increased hardware consumption\"],\"correctIndex\":2}"
                        + "]";
            } else if ("EVENT_FORM".equals(detectedType) || "REG_FORM".equals(detectedType)) {
                generatedTitle = "AI Generated Registration: " + capitalize(prompt);
                generatedContentJson = "["
                        + "{\"name\":\"fullName\",\"label\":\"Full Name\",\"type\":\"text\",\"required\":true},"
                        + "{\"name\":\"email\",\"label\":\"Email Address\",\"type\":\"email\",\"required\":true},"
                        + "{\"name\":\"experience\",\"label\":\"Experience Level\",\"type\":\"select\",\"options\":[\"Beginner\",\"Intermediate\",\"Advanced\"],\"required\":true},"
                        + "{\"name\":\"comments\",\"label\":\"Why do you want to join this event?\",\"type\":\"textarea\",\"required\":false}"
                        + "]";
            } else if ("ASSIGNMENT".equals(detectedType)) {
                generatedTitle = "Assignment: Deep Dive into " + capitalize(prompt);
                generatedContentJson = "{"
                        + "\"description\":\"Complete a comprehensive research paper or code project regarding "
                        + prompt + ". Focus on architectural patterns and scalability.\","
                        + "\"suggestedDeadlineDays\":7,"
                        + "\"instructions\":\"Submit your source files as a single zip archive or upload your report in PDF format.\""
                        + "}";
            } else if ("EXAM".equals(detectedType)) {
                generatedTitle = "Exam Paper: " + capitalize(prompt);
                generatedContentJson = "{"
                        + "\"subject\":\"" + capitalize(prompt) + "\","
                        + "\"totalMarks\":50,"
                        + "\"questions\":["
                        + "\"Q1 (10 Marks): Explain the life cycle and memory allocation of " + prompt + ".\","
                        + "\"Q2 (20 Marks): Write a sample code application implementing structural decorators for "
                        + prompt + ".\","
                        + "\"Q3 (20 Marks): Debug and analyze thread safety or data consistency issues in " + prompt
                        + ".\""
                        + "]"
                        + "}";
            } else { // ANNOUNCEMENT
                generatedTitle = "Announcement: " + capitalize(prompt);
                generatedContentJson = "{"
                        + "\"bulletin\":\"We are pleased to announce a new module focusing on " + prompt
                        + " beginning this week! Keep an eye on your schedule for virtual classrooms and assignment logs.\""
                        + "}";
            }
        }

        response.put("title", generatedTitle);
        response.put("content", generatedContentJson);
        response.put("isLiveAi", geminiSuccess);

        return ResponseEntity.ok(response);
    }

    private String normalizeGeminiJson(String json, String type) {
        if (json == null || json.trim().isEmpty()) {
            return json;
        }
        String trimmed = json.trim();
        // Remove markdown formatting backticks if present
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            int lastTicks = trimmed.lastIndexOf("```");
            if (firstNewline != -1 && lastTicks > firstNewline) {
                trimmed = trimmed.substring(firstNewline + 1, lastTicks).trim();
            }
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Object obj = mapper.readValue(trimmed, Object.class);
            if (obj instanceof Map) {
                Map map = (Map) obj;
                // If type is a List-based structure but Gemini wrapped it in an object, extract
                // the list
                if ("QUIZ".equals(type) || "EVENT_FORM".equals(type) || "REG_FORM".equals(type)) {
                    for (Object key : map.keySet()) {
                        Object val = map.get(key);
                        if (val instanceof List) {
                            return mapper.writeValueAsString(val);
                        }
                    }
                }
            }
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            System.err.println("JSON Normalization warning: " + e.getMessage());
        }
        return trimmed;
    }

    private String callGemini(String systemPrompt, String userPrompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                + apiKey;
        RestTemplate restTemplate = new RestTemplate();

        // Construct Gemini JSON payload structure
        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> part = new HashMap<>();
        part.put("text", systemPrompt + "\n\nUser Input Topic: " + userPrompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        requestBody.put("contents", List.of(content));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
        Map responseBody = response.getBody();

        if (responseBody != null && responseBody.containsKey("candidates")) {
            List candidates = (List) responseBody.get("candidates");
            if (!candidates.isEmpty()) {
                Map candidate = (Map) candidates.get(0);
                Map contentObj = (Map) candidate.get("content");
                List parts = (List) contentObj.get("parts");
                if (!parts.isEmpty()) {
                    Map partObj = (Map) parts.get(0);
                    return (String) partObj.get("text");
                }
            }
        }

        throw new RuntimeException("Empty response candidates list from Gemini API.");
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty())
            return str;
        return Arrays.stream(str.split("\\s+"))
                .map(t -> t.substring(0, 1).toUpperCase() + t.substring(1))
                .collect(Collectors.joining(" "));
    }
}
