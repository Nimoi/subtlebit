<?php 
    $pageTitle = 'Adventure';
    include '../header.php'; 
?>

    <link rel="stylesheet" href="/adventure/adventure.css">

    <main class="container">
        <div class="panel">
            <canvas></canvas>
        </div>
    </main>

    <script src="/adventure/adventure.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        var socket = io();

        socket.on("connect", () => {
            console.log(socket.id);
            document.write('Connected to chat');
        });

        socket.on("chat", (chat) => {
            console.log(chat);
            printChat(chat);
        });

        function printChat(chat) {
            
            let html = `<p>
                <strong style="color:${chat.context.color}">${chat.context['display-name']}</strong>
                ${chat.message}
            </p>`;
            document.write(html);
        }
    </script>

<?php include '../footer.php'; ?>
