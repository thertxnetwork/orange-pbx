<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$db_host = '127.0.0.1';
$db_user = 'mbillingUser';
$db_pass = 'O1vL4zav5q2TtvxC';
$db_name = 'mbilling';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $data['action'] ?? '';

// Response function
function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Login action
if ($action === 'login') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        sendResponse(false, 'Username and password required');
    }
    
    $hashedPassword = sha1($password);
    
    $stmt = $conn->prepare("SELECT id, username, firstname, lastname, email, active FROM pkg_user WHERE username = ? AND password = ? LIMIT 1");
    $stmt->bind_param('ss', $username, $hashedPassword);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        if ($row['active'] == 1) {
            sendResponse(true, 'Login successful', $row);
        } else {
            sendResponse(false, 'Account is inactive');
        }
    } else {
        sendResponse(false, 'Invalid username or password');
    }
}

// Dashboard stats
elseif ($action === 'dashboard') {
    $stats = [];
    
    // Total calls today
    $result = $conn->query("SELECT COUNT(*) as count, SUM(sessiontime) as duration FROM pkg_cdr WHERE DATE(starttime) = CURDATE()");
    $row = $result->fetch_assoc();
    $stats['totalCalls'] = (int)$row['count'];
    $stats['totalDuration'] = (int)$row['duration'];
    
    // Active customers
    $result = $conn->query("SELECT COUNT(*) as count FROM pkg_user WHERE active = 1");
    $row = $result->fetch_assoc();
    $stats['activeCustomers'] = (int)$row['count'];
    
    // Revenue today
    $result = $conn->query("SELECT SUM(buycost) as revenue FROM pkg_cdr WHERE DATE(starttime) = CURDATE()");
    $row = $result->fetch_assoc();
    $stats['revenueToday'] = (float)$row['revenue'];
    
    // Active trunks
    $result = $conn->query("SELECT COUNT(*) as count FROM pkg_trunk WHERE status = 1");
    $row = $result->fetch_assoc();
    $stats['activeTrunks'] = (int)$row['count'];
    
    sendResponse(true, 'Dashboard stats retrieved', $stats);
}

// Recent calls
elseif ($action === 'recentCalls') {
    $limit = (int)($data['limit'] ?? 10);
    
    $stmt = $conn->prepare("SELECT id, callerid, dst, starttime, sessiontime, terminatecauseid, buycost FROM pkg_cdr ORDER BY starttime DESC LIMIT ?");
    $stmt->bind_param('i', $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $calls = [];
    while ($row = $result->fetch_assoc()) {
        $calls[] = $row;
    }
    
    sendResponse(true, 'Recent calls retrieved', $calls);
}

// Customers list
elseif ($action === 'customers') {
    $limit = (int)($data['limit'] ?? 10);
    $offset = (int)($data['offset'] ?? 0);
    
    $stmt = $conn->prepare("SELECT id, username, firstname, lastname, email, credit, active FROM pkg_user ORDER BY id DESC LIMIT ? OFFSET ?");
    $stmt->bind_param('ii', $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $customers = [];
    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }
    
    sendResponse(true, 'Customers retrieved', $customers);
}

// Search calls
elseif ($action === 'searchCalls') {
    $callerid = $data['callerid'] ?? '';
    $dst = $data['dst'] ?? '';
    $dateFrom = $data['dateFrom'] ?? '';
    $dateTo = $data['dateTo'] ?? '';
    $limit = (int)($data['limit'] ?? 10);
    
    $where = [];
    $params = [];
    $types = '';
    
    if (!empty($callerid)) {
        $where[] = "callerid LIKE ?";
        $params[] = "%$callerid%";
        $types .= 's';
    }
    
    if (!empty($dst)) {
        $where[] = "dst LIKE ?";
        $params[] = "%$dst%";
        $types .= 's';
    }
    
    if (!empty($dateFrom)) {
        $where[] = "DATE(starttime) >= ?";
        $params[] = $dateFrom;
        $types .= 's';
    }
    
    if (!empty($dateTo)) {
        $where[] = "DATE(starttime) <= ?";
        $params[] = $dateTo;
        $types .= 's';
    }
    
    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
    $params[] = $limit;
    $types .= 'i';
    
    $stmt = $conn->prepare("SELECT id, callerid, dst, starttime, sessiontime, terminatecauseid, buycost FROM pkg_cdr $whereClause ORDER BY starttime DESC LIMIT ?");
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $calls = [];
    while ($row = $result->fetch_assoc()) {
        $calls[] = $row;
    }
    
    sendResponse(true, 'Calls retrieved', $calls);
}

else {
    sendResponse(false, 'Invalid action');
}

$conn->close();
