<?php
// seed_demo_data.php
// Script de seeding exhaustif pour les données de démo AGHeal
// Version synchronisée avec le planning officiel et les nouveaux lieux/activités

$host = '127.0.0.1';
$port = '3306';
$dbname = 'agheal';
$username = 'root';
$password = 'root123';

function generate_uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

echo "=== SEEDING DEMO DATA AGHEAL ===\n";
echo "Connexion à MySQL $host:$port (base: $dbname)...\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "✅ Connexion réussie !\n\n";

    // --- 1. LIEUX ---
    echo "--- 1. Configuration des Lieux ---\n";
    $locationsData = [
        ['name' => 'Forêt de Brumath', 'address' => 'Forêt de Brumath', 'city' => 'Brumath', 'notes' => 'Point de RDV parking principal'],
        ['name' => 'Patio des associations', 'address' => 'Cour du château', 'city' => 'Brumath', 'notes' => 'Cour intérieure du château'],
        ['name' => 'Salle de musculation', 'address' => 'Cour du château', 'city' => 'Brumath', 'notes' => 'Salle réservée AGHeal'],
        ['name' => 'Centre Aquatique Brumath', 'address' => 'Rue du Centre', 'city' => 'Brumath', 'notes' => 'Bassin intérieur']
    ];

    $locationIds = [];
    foreach ($locationsData as $loc) {
        $stmt = $pdo->prepare("SELECT id FROM locations WHERE name = ?");
        $stmt->execute([$loc['name']]);
        $id = $stmt->fetchColumn();
        if (!$id) {
            $id = generate_uuid();
            $pdo->prepare("INSERT INTO locations (id, name, address, city, notes) VALUES (?, ?, ?, ?, ?)")
                ->execute([$id, $loc['name'], $loc['address'], $loc['city'], $loc['notes']]);
            echo "✅ Lieu créé : {$loc['name']}\n";
        }
        $locationIds[$loc['name']] = $id;
    }

    // --- 2. TYPES DE SÉANCES (ACTIVITÉS) ---
    echo "\n--- 2. Configuration des Activités ---\n";
    $typesData = [
        ['name' => 'Marche nordique', 'desc' => 'Activité cardio et endurance. Mobilité, endurance, bien-être.', 'loc' => 'Forêt de Brumath'],
        ['name' => 'Musculation santé', 'desc' => 'Renforcement musculaire adapté. Améliorer la force et la condition physique.', 'loc' => 'Salle de musculation'],
        ['name' => 'Pilates', 'desc' => 'Travail postural. Renforcement du centre du corps, mobilité.', 'loc' => 'Salle de musculation'],
        ['name' => 'Renforcement conscientisé', 'desc' => 'Travail musculaire avec attention aux sensations.', 'loc' => 'Patio des associations'],
        ['name' => 'Séance à domicile', 'desc' => 'Séance personnalisée chez le participant.', 'loc' => NULL],
        ['name' => 'Gym sur chaise', 'desc' => 'Activité adaptée pour mobilité réduite.', 'loc' => 'Patio des associations'],
        ['name' => 'Coaching natation', 'desc' => 'Apprentissage et perfectionnement technique en natation.', 'loc' => 'Centre Aquatique Brumath'],
        ['name' => 'Yoga dynamique', 'desc' => 'Enchaînement de postures fluides et respiration.', 'loc' => 'Patio des associations']
    ];

    $typeIds = [];
    foreach ($typesData as $type) {
        $stmt = $pdo->prepare("SELECT id FROM session_types WHERE name = ?");
        $stmt->execute([$type['name']]);
        $id = $stmt->fetchColumn();
        if (!$id) {
            $id = generate_uuid();
            $defaultLoc = $type['loc'] ? ($locationIds[$type['loc']] ?? NULL) : NULL;
            $pdo->prepare("INSERT INTO session_types (id, name, description, default_location_id) VALUES (?, ?, ?, ?)")
                ->execute([$id, $type['name'], $type['desc'], $defaultLoc]);
            echo "✅ Activité créée : {$type['name']}\n";
        }
        $typeIds[$type['name']] = $id;
    }

    // --- 3. GROUPES ---
    echo "\n--- 3. Configuration des Groupes ---\n";
    $groupsData = [
        ['name' => 'Seniors Dynamiques', 'details' => 'Groupe orienté mobilité et prévention des chutes'],
        ['name' => 'Performance & Cardio', 'details' => 'Pour ceux qui recherchent de l\'intensité'],
        ['name' => 'Rééducation Posturale', 'details' => 'Focus sur le dos et le centre du corps'],
        ['name' => 'Sport en Entreprise', 'details' => 'Sessions réservées aux partenaires locaux']
    ];

    $groupIds = [];
    foreach ($groupsData as $grp) {
        $stmt = $pdo->prepare("SELECT id FROM groups WHERE name = ?");
        $stmt->execute([$grp['name']]);
        $id = $stmt->fetchColumn();
        if (!$id) {
            $id = generate_uuid();
            $pdo->prepare("INSERT INTO groups (id, name, details) VALUES (?, ?, ?)")
                ->execute([$id, $grp['name'], $grp['details']]);
            echo "✅ Groupe créé : {$grp['name']}\n";
        }
        $groupIds[] = $id;
    }

    // --- 4. COACHS & CLIENTS ---
    echo "\n--- 4. Création des Utilisateurs ---\n";
    
    // Coaches
    $coaches = [
        ['email' => 'guillaume.trautmann@agheal.fr', 'first' => 'Guillaume', 'last' => 'Trautmann'],
        ['email' => 'amandine.motsch@agheal.fr', 'first' => 'Amandine', 'last' => 'Motsch'],
        ['email' => 'marc.coach@agheal.fr', 'first' => 'Marc', 'last' => 'Sport'],
        ['email' => 'sophie.coach@agheal.fr', 'first' => 'Sophie', 'last' => 'Heal']
    ];

    $coachIds = [];
    foreach ($coaches as $coach) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$coach['email']]);
        $uid = $stmt->fetchColumn();
        if (!$uid) {
            $uid = generate_uuid();
            $pdo->prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)")
                ->execute([$uid, $coach['email'], password_hash('password123', PASSWORD_BCRYPT)]);
            $pdo->prepare("UPDATE profiles SET first_name = ?, last_name = ?, statut_compte = 'actif' WHERE id = ?")
                ->execute([$coach['first'], $coach['last'], $uid]);
            $pdo->prepare("INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, 'coach')")->execute([$uid]);
            echo "👤 Coach créé : {$coach['email']}\n";
        }
        $coachIds[] = $uid;
    }

    // Clients
    $firstNames = ['Jean', 'Marie', 'Pierre', 'Julie', 'Thomas', 'Sophie', 'Lucas', 'Emma', 'Antoine', 'Léa', 'Nicolas', 'Chloé', 'Benoit', 'Camille', 'Maxime'];
    $lastNames = ['Dupont', 'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel'];
    
    $clientIds = [];
    for ($i = 0; $i < 15; $i++) {
        $email = "client{$i}@example.com";
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $uid = $stmt->fetchColumn();
        if (!$uid) {
            $uid = generate_uuid();
            $pdo->prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)")
                ->execute([$uid, $email, password_hash('password123', PASSWORD_BCRYPT)]);
            $first = $firstNames[$i];
            $last = $lastNames[$i];
            $pdo->prepare("UPDATE profiles SET first_name = ?, last_name = ?, payment_status = ?, renewal_date = DATE_ADD(CURDATE(), INTERVAL 30 DAY), statut_compte = 'actif' WHERE id = ?")
                ->execute([$first, $last, ($i % 3 == 0 ? 'en_attente' : 'a_jour'), $uid]);
            
            // Assign to 1-2 random groups
            $randGroup = $groupIds[array_rand($groupIds)];
            $pdo->prepare("INSERT IGNORE INTO user_groups (user_id, group_id, assigned_by) VALUES (?, ?, ?)")
                ->execute([$uid, $randGroup, $coachIds[0]]);
                
            echo "👥 Client créé : $first $last\n";
        }
        $clientIds[] = $uid;
    }

    // --- 5. PLANNING & SÉANCES ---
    echo "\n--- 5. Génération du Planning ---\n";
    
    $planningSemaine = [
        ['day' => 'Tuesday', 'start' => '18:30', 'end' => '19:30', 'type' => 'Marche nordique', 'title' => 'Marche Nordique Forêt'],
        ['day' => 'Tuesday', 'start' => '18:00', 'end' => '19:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé Patio'],
        ['day' => 'Thursday', 'start' => '18:00', 'end' => '19:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé Jeudi'],
        ['day' => 'Saturday', 'start' => '09:00', 'end' => '10:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé Matin 1'],
        ['day' => 'Saturday', 'start' => '10:00', 'end' => '11:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé Matin 2'],
        ['day' => 'Saturday', 'start' => '11:00', 'end' => '12:00', 'type' => 'Pilates', 'title' => 'Pilates Brumath']
    ];

    // Générer pour les 4 prochaines semaines
    for ($week = 0; $week < 4; $week++) {
        foreach ($planningSemaine as $p) {
            $date = date('Y-m-d', strtotime("next {$p['day']} +$week week"));
            $typeId = $typeIds[$p['type']];
            $locId = $pdo->query("SELECT default_location_id FROM session_types WHERE id = '$typeId'")->fetchColumn();
            
            $stmt = $pdo->prepare("SELECT id FROM sessions WHERE date = ? AND start_time = ? AND type_id = ?");
            $stmt->execute([$date, $p['start'], $typeId]);
            if (!$stmt->fetch()) {
                $sid = generate_uuid();
                $pdo->prepare("INSERT INTO sessions (id, title, type_id, location_id, date, start_time, end_time, capacity, status, created_by)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)")
                    ->execute([$sid, $p['title'], $typeId, $locId, $date, $p['start'], $p['end'], 12, $coachIds[array_rand($coachIds)]]);
                
                // Random registrations for some sessions
                if (mt_rand(0, 1)) {
                    $randClients = array_rand($clientIds, 3);
                    foreach ((array)$randClients as $idx) {
                        $pdo->prepare("INSERT IGNORE INTO registrations (id, session_id, user_id) VALUES (?, ?, ?)")
                            ->execute([generate_uuid(), $sid, $clientIds[$idx]]);
                    }
                }
            }
        }
    }

    // Séances additionnelles (10+)
    $others = ['Coaching natation', 'Yoga dynamique', 'Renforcement conscientisé', 'Gym sur chaise'];
    for ($i = 0; $i < 12; $i++) {
        $act = $others[array_rand($others)];
        $date = date('Y-m-d', strtotime("+".mt_rand(1, 20)." days"));
        $start = mt_rand(9, 17) . ":00";
        $end = (substr($start, 0, 2) + 1) . ":00";
        $typeId = $typeIds[$act];
        $locId = $pdo->query("SELECT default_location_id FROM session_types WHERE id = '$typeId'")->fetchColumn();

        $sid = generate_uuid();
        $pdo->prepare("INSERT IGNORE INTO sessions (id, title, type_id, location_id, date, start_time, end_time, capacity, status, created_by)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)")
            ->execute([$sid, "Session de $act", $typeId, $locId, $date, $start, $end, 10, $coachIds[array_rand($coachIds)]]);
    }

    echo "✅ Planning généré avec succès.\n";
    echo "\n🎉 SEEDING TERMINÉ !\n";

} catch (PDOException $e) {
    echo "❌ Erreur : " . $e->getMessage() . "\n";
}
