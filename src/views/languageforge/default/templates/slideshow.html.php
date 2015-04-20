        <div id="promotion" class="container">
            <div id="slides">
                <div class="slides_container">

                    <?php foreach ($slides as $slide): ?>

                    <div class="slides_content">
                        <img src="<?php echo "/images/languageforge/default/" . $slide['image_url'] ?>" alt="<?php $slide['image_url'] ?>" width="300" height="349" style="margin-top:110px; border: 2px solid grey" class="left png_bg">
                        <h2 class="left" style="margin-top: 110px;"><?php echo $slide['title'] ?></h2>
                        <p class="left" style="margin-top: 10px;"><?php echo $slide['summary'] ?></p>
                        <input type="button" class="btn standard-btn standard-btn-big" value="Learn More" onclick="window.location='<?php echo $slide['target_url'] ?>';" />
                        <p style="margin-top: 50px;"><?php echo $slide['social_media'] ?></p>
                    </div>

                    <?php endforeach ?>

                </div>
            </div>
        </div>
