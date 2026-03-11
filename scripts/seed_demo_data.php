<?php
// seed_demo_data.php
// Script de seeding pour les données de démo AGHeal

$host = '127.0.0.1';
$port = '3306';
$dbname = 'agheal';
$username = 'root';
$password = 'root123';

echo "=== SEEDING DEMO DATA ===\n";
echo "Connexion à MySQL $host:$port (base: $dbname)...\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "✅ Connexion réussie !\n\n";

    // 1. Assurer que les coachs existent et ont le bon rôle
    echo "--- 1. Configuration des Coachs ---\n";
    
    $coaches = [
        ['email' => 'guillaume.trautmann@agheal.fr', 'first' => 'Guillaume', 'last' => 'Trautmann'],
        ['email' => 'amandine.motsch@agheal.fr', 'first' => 'Amandine', 'last' => 'Motsch']
    ];

    foreach ($coaches as $coach) {
        $email = $coach['email'];
        // Vérifier si l'user existe
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        $userId = $user ? $user['id'] : null;

        if (!$userId) {
            // Créer l'user
            echo "Création du coach $email...\n";
            $userId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
            $hash = password_hash('password123', PASSWORD_BCRYPT); // Mot de passe par défaut
            
            $pdo->prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, NOW())")
                ->execute([$userId, $email, $hash]);
                
            // Le trigger after_user_insert crée le profil et le rôle adherent
            // On met à jour le profil
            $pdo->prepare("UPDATE profiles SET first_name = ?, last_name = ?, statut_compte = 'actif' WHERE id = ?")
                ->execute([$coach['first'], $coach['last'], $userId]);
        } else {
            echo "Coach $email existe déjà (ID: $userId).\n";
        }

        // Assurer le rôle 'coach'
        $stmt = $pdo->prepare("SELECT role FROM user_roles WHERE user_id = ? AND role = 'coach'");
        $stmt->execute([$userId]);
        if (!$stmt->fetch()) {
            $pdo->prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'coach')")->execute([$userId]);
            echo "✅ Rôle 'coach' ajouté pour $email.\n";
        } else {
            echo "ℹ️ $email a déjà le rôle 'coach'.\n";
        }
    }

    // 2. Création de clients de démo
    echo "\n--- 2. Création des Clients de Démo ---\n";
    
    $demoClients = [
        [
            'email' => 'jean.dupont@example.com', 'first' => 'Jean', 'last' => 'Dupont', 
            'phone' => '0601020304', 'age' => 45, 'payment' => 'a_jour',
            'remarks' => 'Douleurs lombaires chroniques', 'coach_notes' => 'Attention aux flexions avant'
        ],
        [
            'email' => 'marie.martin@example.com', 'first' => 'Marie', 'last' => 'Martin', 
            'phone' => '0699887766', 'age' => 32, 'payment' => 'en_attente',
            'remarks' => 'Asthme léger', 'coach_notes' => 'Progression rapide sur le cardio'
        ]
    ];

    $clientIds = [];

    foreach ($demoClients as $client) {
        $email = $client['email'];
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        $userId = $user ? $user['id'] : null;

        if (!$userId) {
            echo "Création du client $email...\n";
            $userId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
            $hash = password_hash('password123', PASSWORD_BCRYPT);
            
            $pdo->prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, NOW())")
                ->execute([$userId, $email, $hash]);
                
            $pdo->prepare("
                UPDATE profiles SET 
                first_name = ?, last_name = ?, phone = ?, age = ?, 
                payment_status = ?, remarks_health = ?, coach_remarks = ?,
                statut_compte = 'actif'
                WHERE id = ?
            ")->execute([
                $client['first'], $client['last'], $client['phone'], $client['age'],
                $client['payment'], $client['remarks'], $client['coach_notes'],
                $userId
            ]);
            echo "✅ Client créé : {$client['first']} {$client['last']}\n";
        } else {
            echo "ℹ️ Client $email existe déjà.\n";
        }
        $clientIds[] = $userId;
    }

    // 3. Création de séances de démo
    echo "\n--- 3. Création des Séances de Démo ---\n";
    
    // Récupérer les IDs nécessaires
    $locationId = $pdo->query("SELECT id FROM locations LIMIT 1")->fetchColumn();
    $typeId = $pdo->query("SELECT id FROM session_types LIMIT 1")->fetchColumn();
    
    // Dates : Aujourd'hui (23/02/2026) et demain
    $today = '2026-02-23';
    $tomorrow = '2026-02-24';
    
    $sessions = [
        ['title' => 'Séance Découverte Matin', 'date' => $today, 'start' => '09:00', 'end' => '10:00'],
        ['title' => 'Renforcement Avancé', 'date' => $today, 'start' => '18:00', 'end' => '19:30'],
        ['title' => 'Yoga Doux', 'date' => $tomorrow, 'start' => '10:00', 'end' => '11:00']
    ];

    foreach ($sessions as $s) {
        // Vérifier doublon
        $stmt = $pdo->prepare("SELECT id FROM sessions WHERE date = ? AND start_time = ?");
        $stmt->execute([$s['date'], $s['start'] . ':00']); // Format TIME MySQL HH:MM:SS
        if (!$stmt->fetch()) {
            $sessionId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
            
            $pdo->prepare("
                INSERT INTO sessions (id, title, date, start_time, end_time, type_id, location_id, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'published', NOW())
            ")->execute([
                $sessionId, $s['title'], $s['date'], $s['start'], $s['end'], $typeId, $locationId
            ]);
            
            echo "✅ Séance créée : {$s['title']} le {$s['date']}\n";
            
            // Inscrire les clients démo à la première séance
            if ($s === $sessions[0]) {
                foreach ($clientIds as $clientId) {
                    $regId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                        mt_rand(0, 0xffff),
                        mt_rand(0, 0x0fff) | 0x4000,
                        mt_rand(0, 0x3fff) | 0x8000,
                        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                    );
                    try {
                        $pdo->prepare("INSERT INTO registrations (id, session_id, user_id, created_at) VALUES (?, ?, ?, NOW())")
                            ->execute([$regId, $sessionId, $clientId]);
                        echo "   -> Client inscrit.\n";
                    } catch (Exception $e) {
                        // Ignorer doublon
                    }
                }
            }
        } else {
            echo "ℹ️ Séance {$s['title']} existe déjà.\n";
        }
    }

    echo "\n🎉 SEEDING TERMINÉ !\n";

} catch (PDOException $e) {
    echo "❌ Erreur : " . $e->getMessage() . "\n";
}
