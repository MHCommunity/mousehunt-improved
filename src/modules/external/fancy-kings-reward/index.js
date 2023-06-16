export default () => {
  onAjaxRequest((req) => {
    if (req.success && req.puzzle_reward) {
      const resume = document.querySelector('.puzzleView__resumeButton');
      if (resume) {
        resume.click();
      }
    }
  }, 'managers/ajax/users/puzzle.php', true);
};
