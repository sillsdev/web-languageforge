        <meta charset="utf-8" />
        <title><?php echo $controller->website->name; ?></title>

        <?php if (isset($cssFiles)): ?>
        <?php foreach($cssFiles as $filename): ?>
        <link rel=stylesheet href="/<?php echo $filename; ?>" />
        <?php endforeach; ?>
        <?php endif; ?>

        <link rel="icon" href="/images/<?php echo $controller->website->base . '/' . $controller->website->theme; ?>/favicon.ico" type="image/x-icon" />
        <link data-require="font-awesome@*" data-semver="4.2.0" rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.2.0/css/font-awesome.css" />

        <script src="/js/lib/jquery-1.8.3.min.js"></script>
        <!-- jquery must be the first js to be loaded -->
