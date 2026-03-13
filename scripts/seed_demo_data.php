<?php
// seed_demo_data.php
// Script de seeding exhaustif pour les données de démo AGHeal
// Version finale : 2 coachs, 10 clients ultra-diversifiés, planning complet
// Configuration pour exécution sur VPS (MariaDB / Coolify)

// NOTE : Pour une exécution directe sur le VPS (via docker exec), utilisez 127.0.0.1 
// ou le nom du service container MariaDB défini dans Coolify.
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
echo "Connexion à MariaDB $host:$port (base: $dbname)...\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "✅ Connexion réussie !\n\n";

    // --- 1. LIEUX ---
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
        }
        $locationIds[$loc['name']] = $id;
    }

    // --- 2. ACTIVITÉS ---
    $typesData = [
        ['name' => 'Marche nordique', 'desc' => 'Activité cardio et endurance. Mobilité, endurance, bien-être.', 'loc' => 'Forêt de Brumath'],
        ['name' => 'Musculation santé', 'desc' => 'Renforcement musculaire adapté. Améliorer la force et la condition physique.', 'loc' => 'Salle de musculation'],
        ['name' => 'Pilates', 'desc' => 'Travail postural. Renforcement du centre du corps, mobilité.', 'loc' => 'Salle de musculation'],
        ['name' => 'Renforcement conscientisé', 'desc' => 'Travail musculaire avec attention aux sensations.', 'loc' => 'Patio des associations']
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
        }
        $typeIds[$type['name']] = $id;
    }

    // --- 3. GROUPES ---
    $groupsData = [
        ['name' => 'Seniors Dynamiques', 'details' => 'Groupe orienté mobilité et prévention des chutes'],
        ['name' => 'Performance & Cardio', 'details' => 'Pour ceux qui recherchent de l\'intensité'],
        ['name' => 'Rééducation Posturale', 'details' => 'Focus sur le dos et le centre du corps'],
        ['name' => 'Sport Santé Entreprise', 'details' => 'Séances adaptées aux salariés']
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
        }
        $groupIds[$grp['name']] = $id;
    }

    // --- 4. COACHS & CLIENTS ---
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
        }
        $coachIds[$coach['last']] = $uid;
    }

    $clientsData = [
        [
            'email' => 'jean.dupont@demo.com', 'first' => 'Jean', 'last' => 'Dupont', 
            'phone' => '06 12 34 56 78', 'age' => 45, 'payment' => 'a_jour',
            'health' => 'Légères douleurs lombaires chroniques.', 'info' => 'Ancien marathonien.',
            'coach' => 'Très volontaire, surveiller l\'alignement du dos.', 'groups' => ['Performance & Cardio']
        ],
        [
            'email' => 'marie.martin@demo.com', 'first' => 'Marie', 'last' => 'Martin', 
            'phone' => '07 88 99 00 11', 'age' => 32, 'payment' => 'en_attente',
            'health' => 'Asthme à l\'effort.', 'info' => 'Préfère le plein air.',
            'coach' => 'Gérer l\'intensité selon les sensations respiratoires.', 'groups' => ['Performance & Cardio']
        ],
        [
            'email' => 'pierre.bernard@demo.com', 'first' => 'Pierre', 'last' => 'Bernard', 
            'phone' => '03 88 45 12 30', 'age' => 74, 'payment' => 'a_jour',
            'health' => 'Prothèse hanche droite (2023).', 'info' => 'Vient pour la convivialité.',
            'coach' => 'Favoriser la mobilité sans impacts.', 'groups' => ['Seniors Dynamiques']
        ],
        [
            'email' => 'julie.dubois@demo.com', 'first' => 'Julie', 'last' => 'Dubois', 
            'phone' => '06 55 44 33 22', 'age' => 29, 'payment' => 'a_jour',
            'health' => 'Rien à signaler.', 'info' => 'Focus sur le gainage.',
            'coach' => 'Peut porter des charges modérées.', 'groups' => ['Rééducation Posturale']
        ],
        [
            'email' => 'thomas.robert@demo.com', 'first' => 'Thomas', 'last' => 'Robert', 
            'phone' => '06 00 11 22 33', 'age' => 52, 'payment' => 'en_attente',
            'health' => 'Entorse cheville mal soignée.', 'info' => 'Cherche la reprise progressive.',
            'coach' => 'Travail proprioception nécessaire.', 'groups' => ['Seniors Dynamiques']
        ],
        [
            'email' => 'sophie.petit@demo.com', 'first' => 'Sophie', 'last' => 'Petit', 
            'phone' => '06 99 88 77 66', 'age' => 41, 'payment' => 'a_jour',
            'health' => 'Souvent fatiguée (travail de nuit).', 'info' => 'Besoin de décompression.',
            'coach' => 'Séances axées sur le bien-être et l\'étirement.', 'groups' => ['Rééducation Posturale']
        ],
        [
            'email' => 'nicolas.lefevre@demo.com', 'first' => 'Nicolas', 'last' => 'Lefevre', 
            'phone' => '06 11 22 33 44', 'age' => 35, 'payment' => 'a_jour',
            'health' => 'Scoliose idiopathique.', 'info' => 'Travail de bureau sédentaire.',
            'coach' => 'Insister sur le renforcement des spinaux.', 'groups' => ['Rééducation Posturale']
        ],
        [
            'email' => 'camille.moreau@demo.com', 'first' => 'Camille', 'last' => 'Moreau', 
            'phone' => '06 22 33 44 55', 'age' => 27, 'payment' => 'en_attente',
            'health' => 'Tendance aux hypoglycémies.', 'info' => 'Débutante complète.',
            'coach' => 'Avoir toujours du sucre à proximité.', 'groups' => ['Seniors Dynamiques']
        ],
        [
            'email' => 'lucas.simon@demo.com', 'first' => 'Lucas', 'last' => 'Simon', 
            'phone' => '07 44 55 66 77', 'age' => 31, 'payment' => 'a_jour',
            'health' => 'Ancien rugbyman, épaule fragile.', 'info' => 'Cherche à maintenir sa masse musculaire.',
            'coach' => 'Éviter les développés au-dessus de la tête.', 'groups' => ['Performance & Cardio']
        ],
        [
            'email' => 'lea.michel@demo.com', 'first' => 'Léa', 'last' => 'Michel', 
            'phone' => '03 66 77 88 99', 'age' => 68, 'payment' => 'a_jour',
            'health' => 'Ostéoporose diagnostiquée.', 'info' => 'Inquiète pour sa densité osseuse.',
            'coach' => 'Travail de mise en charge modérée très bénéfique.', 'groups' => ['Seniors Dynamiques', 'Rééducation Posturale']
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
            $pdo->prepare("UPDATE profiles SET first_name=?, last_name=?, phone=?, age=?, payment_status=?, remarks_health=?, additional_info=?, coach_remarks=?, statut_compte='actif', renewal_date=DATE_ADD(CURDATE(), INTERVAL 30 DAY) WHERE id=?")
                ->execute([$c['first'], $c['last'], $c['phone'], $c['age'], $c['payment'], $c['health'], $c['info'], $c['coach'], $uid]);

            foreach ($c['groups'] as $gName) {
                if (isset($groupIds[$gName])) {
                    $pdo->prepare("INSERT IGNORE INTO user_groups (user_id, group_id, assigned_by) VALUES (?, ?, ?)")
                        ->execute([$uid, $groupIds[$gName], $coachIds['Trautmann']]);
                }
            }
        }
        $clientUids[] = $uid;
    }

    // --- 5. PLANNING ---
    $planning = [
        ['day' => 'Tuesday', 'start' => '18:30', 'end' => '19:30', 'type' => 'Marche nordique', 'title' => 'Marche Nordique (Démo)'],
        ['day' => 'Tuesday', 'start' => '18:00', 'end' => '19:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé (Démo)'],
        ['day' => 'Thursday', 'start' => '18:00', 'end' => '19:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé (Jeudi)'],
        ['day' => 'Saturday', 'start' => '09:00', 'end' => '10:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé (Matin 1)'],
        ['day' => 'Saturday', 'start' => '10:00', 'end' => '11:00', 'type' => 'Musculation santé', 'title' => 'Muscu Santé (Matin 2)'],
        ['day' => 'Saturday', 'start' => '11:00', 'end' => '12:00', 'type' => 'Pilates', 'title' => 'Pilates Postural (Démo)']
    ];

    for ($week = 0; $week < 4; $week++) {
        foreach ($planning as $p) {
            $date = date('Y-m-d', strtotime("next {$p['day']} +$week week"));
            $typeId = $typeIds[$p['type']];
            $locId = $pdo->query("SELECT default_location_id FROM session_types WHERE id = '$typeId'")->fetchColumn();
            
            $stmt = $pdo->prepare("SELECT id FROM sessions WHERE date = ? AND start_time = ? AND type_id = ?");
            $stmt->execute([$date, $p['start'], $typeId]);
            if (!$stmt->fetch()) {
                $sid = generate_uuid();
                $pdo->prepare("INSERT INTO sessions (id, title, type_id, location_id, date, start_time, end_time, capacity, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)")
                    ->execute([sid, $p['title'], $typeId, $locId, $date, $p['start'], $p['end'], 10, $coachIds['Trautmann']]);
                
                $nbInscrits = mt_rand(3, 7);
                $sessionClients = (array)array_rand($clientUids, $nbInscrits);
                foreach ($sessionClients as $idx) {
                    $pdo->prepare("INSERT IGNORE INTO registrations (id, session_id, user_id) VALUES (?, ?, ?)")
                        ->execute([generate_uuid(), $sid, $clientUids[$idx]]);
                }
            }
        }
    }

    echo "✅ Seeding terminé avec 2 coachs, 10 clients diversifiés et le planning complet.\n";

} catch (PDOException $e) {
    echo "❌ Erreur : " . $e->getMessage() . "\n";
}
