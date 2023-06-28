<div class="fancy-button mousehuntTooltipParent">
  <div class="fancy-button-image"></div>
  <span class="text">Continue</span>
  <div class="mousehuntTooltip tight top noEvents">
    <strong>Cloudstone Bangle</strong>
    <div class="fancy-button-hover-label">High Altitude Loot</div>
    <div class="mousehuntTooltip-arrow"></div>
  </div>
</div>

.fancy-button {
  display: inline-block;
  width: 59px;
  height: 30px;
  background-image: url(https://www.mousehuntgame.com/images/ui/hud/floating_islands/adventure_board/letters.png?asset_cache_version=2);
  position: relative;
  transition: filter .5s;
  line-height: 26px;
  text-align: center;
  position: relative;
  cursor: pointer;
}
.fancy-button-image {
  display: inline-block;
  width: 35px;
  height: 35px;
  position: absolute;
  background-image: url(https://www.mousehuntgame.com/images/ui/journal/relichunter_catch.png?asset_cache_version=2);
  left: -21px;
  bottom: 11px;
  background-size: contain;
  background-repeat: no-repeat;
  filter: drop-shadow(1px 1px 1px #f1de8a);
}

.fancy-button-hover-label {
  color: #8c4f1c;
  font-size: 9px;
}

.fancy-button .mousehuntTooltip {
    bottom: 130%;
    left: -50px;
    right: -50px;
    text-align: center;
    line-height: normal;
}

.fancy-button:hover {
    filter: hue-rotate(180deg);
}

.fancy-button:hover .fancy-button-image {
    filter: hue-rotate(180deg);
}
