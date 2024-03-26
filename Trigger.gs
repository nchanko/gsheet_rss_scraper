function createMonthlyTrigger() {
    // First, delete existing triggers for the specific function to avoid duplicates
    var existingTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < existingTriggers.length; i++) {
      if (existingTriggers[i].getHandlerFunction() === 'archiveDataByMonth') {
        ScriptApp.deleteTrigger(existingTriggers[i]);
      }
    }
    
    // Create a new monthly trigger that runs 'yourFunctionName' at midnight on the first of each month
    ScriptApp.newTrigger('archiveDataByMonth')
      .timeBased()
      .onMonthDay(1)
      .atHour(0)
      .inTimezone(Session.getScriptTimeZone()) // Ensure it uses the script's time zone
      .create();
  }
  
  