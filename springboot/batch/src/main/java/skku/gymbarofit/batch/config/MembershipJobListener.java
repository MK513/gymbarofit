package skku.gymbarofit.batch.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MembershipJobListener implements JobExecutionListener {

    @Override
    public void beforeJob(JobExecution jobExecution) {
        Long timestamp = jobExecution.getJobParameters().getLong("timestamp");
        log.info("updateMembershipJob started - timestamp: {}", timestamp);
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        log.info("updateMembershipJob finished - status: {}", jobExecution.getStatus());
    }
}
