# Boosted Adatmodell (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ DAILYLOG : "készít (kliens)"
    USER ||--o{ WEEKLYPLAN : "megkap (kliens)"
    USER ||--o{ REVIEW : "kap (edző)"
    USER ||--o{ INVITE : "generál (edző)"
    USER |o--o{ USER : "hozzárendelve (coach_id)"
    
    USER {
        int id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string role "COACH vagy CLIENT"
        int coach_id FK "nullable"
        datetime join_date
        int total_boosts
        float average_rating
    }

    DAILYLOG {
        int id PK
        int client_id FK
        date date
        int sleep_hours
        int stress_level
        float water_liters
        int workout_minutes
        string mood
    }

    WEEKLYPLAN {
        int id PK
        int client_id FK
        date week_start_date
        string plan_data "JSON string"
        string difficulty_level
    }

    INVITE {
        int id PK
        int coach_id FK
        string client_email
        string token UK
        datetime expires_at
        boolean used
    }

    REVIEW {
        int id PK
        int coach_id FK
        int client_id FK
        int rating
        string review_text
    }