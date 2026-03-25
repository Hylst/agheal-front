<?php
// scripts/fix_schema.php
// Script de réparation du schéma de base de données AGHeal

$host = '127.0.0.1';
$port = '3306';
$dbname = 'agheal';
$username = 'root';
$password = 'root123';

echo "=== VÉRIFICATION ET RÉPARATION DU SCHÉMA ===\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "✅ Connexion réussie à la base de données.\n\n";

    // 1. Création des tables manquantes
    echo "--- 1. Vérification des tables manquantes ---\n";
    
    $tables = [
        'logs' => "CREATE TABLE IF NOT EXISTS logs (
            id CHAR(36) NOT NULL DEFAULT (UUID()),
            user_id CHAR(36) DEFAULT NULL,
            action VARCHAR(100) NOT NULL,
            details JSON DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_logs_user (user_id),
            INDEX idx_logs_action (action),
            INDEX idx_logs_created_at (created_at),
            CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        'password_resets' => "CREATE TABLE IF NOT EXISTS password_resets (
            id CHAR(36) NOT NULL DEFAULT (UUID()),
            user_id CHAR(36) NOT NULL,
            token CHAR(64) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used_at TIMESTAMP DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_password_resets_token (token),
            INDEX idx_password_resets_user (user_id),
            CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        'refresh_tokens' => "CREATE TABLE IF NOT EXISTS refresh_tokens (
            id CHAR(36) NOT NULL DEFAULT (UUID()),
            user_id CHAR(36) NOT NULL,
            token CHAR(64) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            revoked_at TIMESTAMP DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_refresh_tokens_token (token),
            INDEX idx_refresh_tokens_user (user_id),
            CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    ];

    foreach ($tables as $name => $sql) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$name'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec($sql);
            echo "✅ Table '$name' créée.\n";
        } else {
            echo "ℹ️ Table '$name' existe déjà.\n";
        }
    }
    echo "\n";

    // 2. Ajout des colonnes manquantes
    echo "--- 2. Vérification des colonnes manquantes ---\n";

    // app_info.updated_by
    $stmt = $pdo->query("SHOW COLUMNS FROM app_info LIKE 'updated_by'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE app_info ADD COLUMN updated_by CHAR(36) DEFAULT NULL");
        echo "✅ Colonne 'updated_by' ajoutée à la table 'app_info'.\n";
        
        // Ajouter la contrainte FK
        try {
            $pdo->exec("ALTER TABLE app_info ADD CONSTRAINT fk_app_info_updated_by FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL");
            echo "✅ Contrainte FK ajoutée pour 'app_info.updated_by'.\n";
        } catch (PDOException $e) {
            echo "⚠️ Impossible d'ajouter la contrainte FK pour 'app_info.updated_by': " . $e->getMessage() . "\n";
        }
    } else {
        echo "ℹ️ Colonne 'updated_by' existe déjà dans 'app_info'.\n";
    }
    echo "\n";

    // 3. Ajout des contraintes FK manquantes
    echo "--- 3. Vérification des contraintes FK manquantes ---\n";

    $constraints = [
        'locations' => [
            'fk_locations_created_by' => "ALTER TABLE locations ADD CONSTRAINT fk_locations_created_by FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL"
        ],
        'session_types' => [
            'fk_session_types_created_by' => "ALTER TABLE session_types ADD CONSTRAINT fk_session_types_created_by FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL"
        ],
        'sessions' => [
            'fk_sessions_created_by' => "ALTER TABLE sessions ADD CONSTRAINT fk_sessions_created_by FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL"
        ],
        'groups' => [
            'fk_groups_created_by' => "ALTER TABLE `groups` ADD CONSTRAINT fk_groups_created_by FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL"
        ],
        'user_groups' => [
            'fk_user_groups_assigned_by' => "ALTER TABLE user_groups ADD CONSTRAINT fk_user_groups_assigned_by FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL"
        ]
    ];

    foreach ($constraints as $table => $fk_list) {
        foreach ($fk_list as $fk_name => $sql) {
            // Vérifier si la contrainte existe via information_schema
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = ? AND table_name = ? AND constraint_name = ?");
            $stmt->execute([$dbname, $table, $fk_name]);
            if ($stmt->fetchColumn() == 0) {
                try {
                    $pdo->exec($sql);
                    echo "✅ Contrainte '$fk_name' ajoutée à la table '$table'.\n";
                } catch (PDOException $e) {
                    echo "⚠️ Erreur lors de l'ajout de '$fk_name' sur '$table': " . $e->getMessage() . "\n";
                }
            } else {
                echo "ℹ️ Contrainte '$fk_name' existe déjà sur '$table'.\n";
            }
        }
    }
    echo "\n";

    // 4. Création des Vues
    echo "--- 4. Création/Mise à jour des Vues ---\n";

    $views = [
        'v_sessions_full' => "CREATE OR REPLACE VIEW v_sessions_full AS
            SELECT 
                s.*,
                st.name AS type_name,
                st.description AS type_description,
                l.name AS location_name,
                l.address AS location_address,
                CONCAT(p.first_name, ' ', p.last_name) AS created_by_name,
                (SELECT COUNT(*) FROM registrations r WHERE r.session_id = s.id) AS registration_count
            FROM sessions s
            LEFT JOIN session_types st ON s.type_id = st.id
            LEFT JOIN locations l ON s.location_id = l.id
            LEFT JOIN profiles p ON s.created_by = p.id",

        'v_profiles_with_roles' => "CREATE OR REPLACE VIEW v_profiles_with_roles AS
            SELECT 
                p.*,
                GROUP_CONCAT(ur.role ORDER BY 
                    CASE ur.role 
                        WHEN 'admin' THEN 1 
                        WHEN 'coach' THEN 2 
                        ELSE 3 
                    END
                ) AS roles,
                (SELECT ur2.role FROM user_roles ur2 WHERE ur2.user_id = p.id 
                 ORDER BY CASE ur2.role WHEN 'admin' THEN 1 WHEN 'coach' THEN 2 ELSE 3 END 
                 LIMIT 1) AS primary_role
            FROM profiles p
            LEFT JOIN user_roles ur ON p.id = ur.user_id
            GROUP BY p.id"
    ];

    foreach ($views as $name => $sql) {
        try {
            $pdo->exec($sql);
            echo "✅ Vue '$name' créée/mise à jour.\n";
        } catch (PDOException $e) {
            echo "❌ Erreur lors de la création de la vue '$name': " . $e->getMessage() . "\n";
        }
    }

    echo "\n=== FIN DE LA VÉRIFICATION ===\n";

} catch (PDOException $e) {
    echo "❌ Erreur de connexion : " . $e->getMessage() . "\n";
    echo "Assurez-vous que le serveur MySQL est démarré et que les identifiants sont corrects.\n";
}
