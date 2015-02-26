        <div class="container" >
            <div class="row sf-3up">

                <?php foreach ($columns as $num => $column): ?>

                <div class="span4 sf-3up-<?php echo $num + 1 ?>">
                    <h3 class="sf-jamaican-yellow"><?php echo $column['title'] ?></h3>
                    <p><?php echo $column['summary']?></p>
                    <?php if ($column['target_url'] != '#'):?>
                    <p class="text-center">
                        <a href="<?php echo $column['target_url'] ?>">
                            <button class="btn sf-btnJ sf-btnJ<?php echo $num + 1 ?>" href="#"><?php echo $column['button']?></button>
                        </a>
                    </p>
                    <?php endif; ?>
                </div>

                <?php endforeach; ?>

            </div>
        </div>
