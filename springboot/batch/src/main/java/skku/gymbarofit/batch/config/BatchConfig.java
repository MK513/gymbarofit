package skku.gymbarofit.batch.config;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.data.RepositoryItemReader;
import org.springframework.batch.item.data.RepositoryItemWriter;
import org.springframework.batch.item.data.builder.RepositoryItemReaderBuilder;
import org.springframework.batch.item.data.builder.RepositoryItemWriterBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.PlatformTransactionManager;
import skku.gymbarofit.core.membership.Membership;
import skku.gymbarofit.core.membership.enums.MembershipStatus;
import skku.gymbarofit.core.membership.repository.MembershipRepository;

import java.time.LocalDateTime;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class BatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager platformTransactionManager;
    private final MembershipRepository membershipRepository;
    private final MembershipJobListener membershipJobListener;

    @Bean
    public Job updateMembershipJob(Step updateMembershipStep) {
        return new JobBuilder("updateMembershipJob", jobRepository)
                .listener(membershipJobListener)
                .start(updateMembershipStep)
                .build();
    }

    @Bean
    public Step updateMembershipStep() {
        return new StepBuilder("updateMembershipStep", jobRepository)
                .<Membership, Membership>chunk(10, platformTransactionManager)
                .reader(membershipReader())
                .processor(expireProcessor())
                .writer(afterWriter())
                .build();
    }

    @Bean
    @StepScope
    public RepositoryItemReader<Membership> membershipReader() {
        return new RepositoryItemReaderBuilder<Membership>()
                .name("membershipReader")
                .pageSize(10)
                .methodName("findPageByStatusAndExpiredAtBefore")
                .arguments(MembershipStatus.ACTIVE, LocalDateTime.now())
                .repository(membershipRepository)
                .sorts(Map.of("id", Sort.Direction.ASC))
                .build();
    }

    @Bean
    public ItemProcessor<Membership, Membership> expireProcessor() {
        return membership -> {
            membership.expire();
            return membership;
        };
    }

    @Bean
    public RepositoryItemWriter<Membership> afterWriter() {
        return new RepositoryItemWriterBuilder<Membership>()
                .repository(membershipRepository)
                .methodName("save")
                .build();
    }
}
