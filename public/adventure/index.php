<?php 
    $pageTitle = 'Adventure';
    include '../header.php'; 
?>

    <link rel="stylesheet" href="/adventure/adventure.css">

    <main class="container">
        <div class="panel">
            <canvas id="canvas"></canvas>
        </div>
    </main>

    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/adventure/adventure.js" type="module"></script>

<?php include '../footer.php'; ?>
