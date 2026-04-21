"""
Task Scheduler for Automation Agents
Runs email reminder agent daily
"""

import schedule
import time
import logging
from datetime import datetime
from email_reminder_agent import EmailReminderAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def run_email_reminders():
    """Job: Run email reminder checks"""
    logger.info("=" * 60)
    logger.info("Running scheduled email reminder job")
    logger.info(f"Time: {datetime.now()}")
    logger.info("=" * 60)
    
    try:
        agent = EmailReminderAgent()
        stats = agent.check_and_send_reminders()
        
        logger.info(f"Job completed successfully")
        logger.info(f"Stats: {stats}")
        
    except Exception as e:
        logger.error(f"Job failed: {e}", exc_info=True)


def main():
    """Main scheduler loop"""
    logger.info("=" * 60)
    logger.info("Email Reminder Scheduler Started")
    logger.info("=" * 60)
    
    # Schedule daily at 9:00 AM
    schedule.every().day.at("09:00").do(run_email_reminders)
    
    # Optional: Additional reminders
    # schedule.every().day.at("18:00").do(run_email_reminders)  # Evening reminder
    
    logger.info("Scheduled jobs:")
    for job in schedule.get_jobs():
        logger.info(f"  - {job}")
    
    logger.info("\nScheduler is running... Press Ctrl+C to stop")
    
    # Keep running
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
            
    except KeyboardInterrupt:
        logger.info("\nScheduler stopped by user")


if __name__ == '__main__':
    main()
