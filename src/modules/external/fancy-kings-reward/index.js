export default () => {
  onAjaxRequest((req) => {
    if (req.success && req.puzzle_reward) {
      const resume = document.querySelector('.puzzleView__resumeButton');
      if (resume) {
        resume.click();
      }

      const horn = document.querySelector('.huntersHornView__horn');
      if (! horn) {
        return;
      }

      const ready = HuntersHorn.isHornCountdownComplete();
      if (! ready) {
        return;
      }
    }
  }, 'managers/ajax/users/puzzle.php', true);
};
