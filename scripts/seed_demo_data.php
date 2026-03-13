<?php
// seed_demo_data.php
// Script de seeding exhaustif pour les données de démo AGHeal
// Version raffinée : 2 coachs, 6 clients diversifiés, planning complet

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
        $groupIds[$grp['name']] = $id;
    }

    // --- 4. COACHS & CLIENTS ---
    echo "\n--- 4. Création des Utilisateurs ---\n";
    
    // Coaches
    $coaches = [
        ['email' => 'guillaume.trautmann@agheal.fr', 'first' => 'Guillaume', 'last' => 'Trautmann'],
        ['email' => 'amandine.motsch@agheal.fr', 'first' => 'Amandine', 'last' => 'Motsch']
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
        $coachIds[$coach['last']] = $uid;
    }

    // Clients (6 Diversifiés)
    $clientsData = [
        [
            'email' => 'jean.dupont@demo.com', 'first' => 'Jean', 'last' => 'Dupont', 
            'phone' => '06 12 34 56 78', 'age' => 45, 'payment' => 'a_jour',
            'health' => 'Légères douleurs lombaires en fin de journée.',
            'info' => 'Ancien coureur, souhaite reprendre sans se blesser.',
            'coach' => 'Très motivé, surveiller sa posture lors des squats.',
            'groups' => ['Performance & Cardio']
        ],
        [
            'email' => 'marie.martin@demo.com', 'first' => 'Marie', 'last' => 'Martin', 
            'phone' => '07 88 99 00 11', 'age' => 32, 'payment' => 'en_attente',
            'health' => 'Asthme d\'effort, utilise un inhalateur.',
            'info' => 'Préfère les séances en extérieur.',
            'coach' => 'Rythme cardio à adapter selon les pics de pollution.',
            'groups' => ['Seniors Dynamiques']
        ],
        [
            'email' => 'pierre.bernard@demo.com', 'first' => 'Pierre', 'last' => 'Bernard', 
            'phone' => '03 88 45 12 30', 'age' => 72, 'payment' => 'a_jour',
            'health' => 'Arthrose aux genoux, mobilité réduite.',
            'info' => 'Vient avec sa femme Léa.',
            'coach' => 'Focus sur la mobilité articulaire douce.',
            'groups' => ['Seniors Dynamiques', 'Rééducation Posturale']
        ],
        [
            'email' => 'julie.dubois@demo.com', 'first' => 'Julie', 'last' => 'Dubois', 
            'phone' => '06 55 44 33 22', 'age' => 28, 'payment' => 'a_jour',
            'health' => 'Aucune contre-indication.',
            'info' => 'Cherche à renforcer sa sangle abdominale.',
            'coach' => 'Très bonne condition physique. Prête pour du Pilates avancé.',
            'groups' => ['Performance & Cardio', 'Rééducation Posturale']
        ],
        [
            'email' => 'thomas.robert@demo.com', 'first' => 'Thomas', 'last' => 'Robert', 
            'phone' => '06 00 11 22 33', 'age' => 50, 'payment' => 'en_attente',
            'health' => 'Opération du ménisque il y a 6 mois.',
            'info' => 'Besoin de renforcement spécifique jambe gauche.',
            'coach' => 'Travail unilatéral recommandé.',
            'groups' => ['Seniors Dynamiques']
        ],
        [
            'email' => 'sophie.petit@demo.com', 'first' => 'Sophie', 'last' => 'Petit', 
            'phone' => '06 99 88 77 66', 'age' => 38, 'payment' => 'a_jour',
            'health' => 'Hypertension contrôlée par médicament.',
            'info' => 'S\'intéresse au yoga et à la gym douce.',
            'coach' => 'Éviter les postures inversées prolongées.',
            'groups' => ['Rééducation Posturale']
        ]
    ];

    $clientUids = [];
    foreach ($clientsData as $c) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$c['email']]);
        $uid = $stmt->fetchColumn();
        if (!$uid) {
            $uid = generate_uuid();
            $pdo->prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)")
                ->execute([$uid, $c['email'], password_hash('password123', PASSWORD_BCRYPT)]);
            
            $pdo->prepare("
                UPDATE profiles SET 
                first_name = ?, last_name = ?, phone = ?, age = ?, 
                payment_status = ?, remarks_health = ?, additional_info = ?, 
                coach_remarks = ?, statut_compte = 'actif', renewal_date = DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                WHERE id = ?
            ")->execute([
                $c['first'], $c['last'], $c['phone'], $c['age'],
                $c['payment'], $c['health'], $c['info'], $c['coach'],
                $uid
            ]);

            foreach ($c['groups'] as $gName) {
                if (isset($groupIds[$gName])) {
                    $pdo->prepare("INSERT IGNORE INTO user_groups (user_id, group_id, assigned_by) VALUES (?, ?, ?)")
                        ->execute([$uid, $groupIds[$gName], $coachIds['Trautmann']]);
                }
            }
            echo "👥 Client créé : {$c['first']} {$c['last']}\n";
        }
        $clientUids[] = $uid;
    }

    // --- 5. PLANNING & SÉANCES ---
    echo "\n--- 5. Génération du Planning ---\n";
    
    $planningSemaine = [
        ['day' => 'Tuesday', 'start' => '18:30', 'end' => '19:30', 'type' => 'Marche nordique', 'title' => 'Marche Nordique Forêt'],
        ['day' => 'Tuesday', 'start' => '18:00', 'end' => '19:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé Patio'],
        ['day' => 'Thursday', 'start' => '18:00', 'end' => '19:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé Jeudi'],
        ['day' => 'Saturday', 'start' => '09:00', 'end' => '10:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé Matin (1)'],
        ['day' => 'Saturday', 'start' => '10:00', 'end' => '11:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé Matin (2)'],
        ['day' => 'Saturday', 'start' => '11:00', 'end' => '12:00', 'type' => 'Pilates', 'title' => 'Pilates Postural']
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
                    ->execute([$sid, $p['title'], $typeId, $locId, $date, $p['start'], $p['end'], 10, $coachIds['Trautmann']]);
                
                // Inscriptions aléatoires (2-4 clients par séance)
                $nbInscrits = mt_rand(2, 4);
                $sessionClients = (array)array_rand($clientUids, $nbInscrits);
                foreach ($sessionClients as $idx) {
                    $pdo->prepare("INSERT IGNORE INTO registrations (id, session_id, user_id) VALUES (?, ?, ?)")
                        ->execute([generate_uuid(), $sid, $clientUids[$idx]]);
                }
            }
        }
    }

    // Séances additionnelles (10+) pour garnir l'historique et le futur
    $others = ['Coaching natation', 'Yoga dynamique', 'Renforcement conscientisé', 'Gym sur chaise'];
    for ($i = 0; $i < 12; $i++) {
        $act = $others[array_rand($others)];
        $offset = mt_rand(-7, 21); // Certaines dans le passé, d'autres dans le futur
        $date = date('Y-m-d', strtotime("$offset days"));
        $start = mt_rand(9, 17) . ":00";
        $end = (substr($start, 0, 2) + 1) . ":00";
        $typeId = $typeIds[$act];
        $locId = $pdo->query("SELECT default_location_id FROM session_types WHERE id = '$typeId'")->fetchColumn();

        $sid = generate_uuid();
        $pdo->prepare("INSERT IGNORE INTO sessions (id, title, type_id, location_id, date, start_time, end_time, capacity, status, created_by)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)")
            ->execute([$sid, "Session Démo $act", $typeId, $locId, $date, $start, $end, 8, $coachIds['Motsch']]);
    }

    echo "✅ Planning et inscriptions générés avec succès.\n";
    echo "\n🎉 SEEDING TERMINÉ AVEC SUCCÈS !\n";

} catch (PDOException $e) {
    echo "❌ Erreur : " . $e->getMessage() . "\n";
}
