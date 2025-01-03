# Part 2 - System design

To solve this problem efficiently, we can have a system that uses PostgreSQL and Ruby on Rails to find the best matching profiles for a given job's requirements. The key focus will be on implementing a **real-time, fast-response** solution that can scale and handle frequent updates.

### **Solution Outline**

1. **Job Requirements Matching Algorithm**
2. **Database Structure**
3. **Rails Classes and Methods**
4. **Performance Considerations**

### 1. **Job Requirements Matching Algorithm**

The core of the solution will involve a matching algorithm that compares job requirements with candidate profiles. Each requirement, such as skills, experience, and location, will be checked individually, and the final match score will be calculated.

#### **Steps:**

1. **Matching Criteria**:
   - For each requirement (e.g., years of experience, skills, location), calculate a score.
   - For each profile, calculate a match score based on these criteria.
   - Sort profiles based on the total match score.
2. **Perfect Match**:
   - A profile is a perfect match if it satisfies **every requirement**.
   - If a profile is not a perfect match, the system will highlight which requirement(s) are not satisfied.
3. **Result Output**:
   - The output will be a list of profiles, each with a flag indicating whether it's a perfect match or not and the list of unsatisfied requirements.

---

### 2. **Database Structure**

To store profiles and job requirements efficiently, we can the database structure like:

#### **Tables:**

1. **Profiles Table**

   - **`id`** (Primary Key)
   - **`name`** (String)
   - **`avatar_url`** (String)
   - **`location`** (String) - Country or city
   - **`years_of_experience`** (Integer)
   - **`skills`** (Array of Strings) - Each skill with its respective years of experience
   - **`current_job_title`** (String)
   - **`education`** (Array of Strings) - Education degrees or certifications
   - **`updated_at`** (Timestamp)

2. **Job Requirements Table**

   - **`id`** (Primary Key)
   - **`job_title`** (String)
   - **`location_required`** (String) - Country or city
   - **`required_skills`** (Array of Strings) - List of skills required
   - **`required_experience`** (Integer) - Minimum years of experience
   - **`created_at`** (Timestamp)
   - **`updated_at`** (Timestamp)

3. **Job Profile Match Table** (Used for caching or storing results)

   - **`job_id`** (Foreign Key)
   - **`profile_id`** (Foreign Key)
   - **`match_score`** (Integer) - A score representing how well the profile matches the job
   - **`perfect_match`** (Boolean) - Whether this profile is a perfect match
   - **`unsatisfied_requirements`** (Text) - A list of unsatisfied requirements (if applicable)
   - **`created_at`** (Timestamp)

   This table stores precomputed matching data for job profiles, which can be updated asynchronously in the background.

---

### 3. **Rails Classes and Methods**

#### **Models:**

1. **Profile Model**:

   ```ruby
   class Profile < ApplicationRecord
     validates :name, presence: true
     validates :skills, presence: true, array: true
     validates :location, presence: true

     has_many :job_profile_matches
   end
   ```

2. **JobRequirement Model**:

   ```ruby
   class JobRequirement < ApplicationRecord
     validates :job_title, presence: true
     validates :required_skills, presence: true, array: true
     validates :location_required, presence: true
   end
   ```

3. **JobProfileMatch Model**:
   ```ruby
   class JobProfileMatch < ApplicationRecord
     belongs_to :profile
     belongs_to :job_requirement
   end
   ```

#### **Match Algorithm**:

We will implement a service class for calculating the match score between a profile and a job requirement:

```ruby
class ProfileMatcher
  def initialize(profile, job_requirement)
    @profile = profile
    @job_requirement = job_requirement
  end

  def match
    score = 0
    unsatisfied_requirements = []

    # Check location
    if @profile.location == @job_requirement.location_required
      score += 1
    else
      unsatisfied_requirements << "Location"
    end

    # Check years of experience
    if @profile.years_of_experience >= @job_requirement.required_experience
      score += 1
    else
      unsatisfied_requirements << "Experience"
    end

    # Check skills
    @job_requirement.required_skills.each do |skill|
      if @profile.skills.include?(skill)
        score += 1
      else
        unsatisfied_requirements << "Skill: #{skill}"
      end
    end

    # Perfect match check
    perfect_match = unsatisfied_requirements.empty?

    { score: score, perfect_match: perfect_match, unsatisfied_requirements: unsatisfied_requirements }
  end
end
```

#### **JobProfileMatch Caching**:

In a real-time system, it's essential to not repeatedly calculate match scores, so we store the results of the match in the `JobProfileMatch` table.

```ruby
class JobProfileMatchService
  def self.match_profiles_to_job(job_requirement)
    profiles = Profile.all
    profiles.each do |profile|
      match_data = ProfileMatcher.new(profile, job_requirement).match
      JobProfileMatch.create!(
        job_requirement: job_requirement,
        profile: profile,
        match_score: match_data[:score],
        perfect_match: match_data[:perfect_match],
        unsatisfied_requirements: match_data[:unsatisfied_requirements].join(", ")
      )
    end
  end
end
```

This will asynchronously compute the match scores in the background and save them in the database. The frontend can query this precomputed data to get fast results.

---

### 4. **Performance Considerations**

- **Asynchronous Processing**:
  The matching algorithm can be computationally expensive, especially when there are many profiles and job requirements. To handle this, we can implement background jobs using **Sidekiq** or **ActiveJob** to compute and store matches asynchronously.

- **Indexing**:
  To speed up queries on large datasets, we should add indexes to frequently queried fields, such as:

  - `profiles(location, skills)`
  - `job_requirements(location_required, required_skills)`

- **Caching**:
  To avoid recalculating matches for each request, we can use caching solutions like Redis for storing intermediate match results or frequently accessed data.

---

This architecture balances the need for real-time responsiveness with the complexity of matching multiple profiles to specific job requirements. It uses a combination of backend processing, caching, and indexing to ensure the system is fast and scalable while providing accurate matching results.

## Handling tradeoffs

### **Eventual Shortcomings and Potential Areas for Improvement**

While the proposed solution offers a solid foundation, there are potential shortcomings and areas for improvement to enhance the system's performance, scalability, and flexibility. Here are some notes:

### 1. **Matching Algorithm's Scalability**

- **Shortcoming**: As the number of profiles and job requirements grows, the matching algorithm may become increasingly slow, particularly if each profile is checked against many job requirements.
- **Improvement**:
  - Implement **parallel processing** or **multi-threading** to compute matches concurrently, especially when calculating the match score for multiple profiles.
  - **Advanced algorithms** (e.g., machine learning-based matching, recommender systems) could be explored to improve the accuracy and relevance of matches, potentially reducing the computational cost in the long run by prioritizing the most relevant profiles for each job.

### 2. **Handling Complex Skill Sets and Experience**

- **Shortcoming**: Skills and experience are currently treated in a binary manner (i.e., does the profile meet the requirement or not). However, skills vary in proficiency and may be subjective. For example, a developer could have "basic," "intermediate," or "expert" skill levels, and years of experience could also vary in their impact on the match.
- **Improvement**:
  - Implement a more granular matching system where skills are weighted by proficiency levels (e.g., "basic", "intermediate", "advanced").
  - Incorporate **experience weighting**: For example, having 5 years of experience in a skill may be weighted more heavily than 2 years of experience.
  - **Natural Language Processing (NLP)** can be applied to interpret skill descriptions more effectively from resumes or profiles, potentially improving matching by better understanding the expertise level.

### 3. **Real-Time Requirements**

- **Shortcoming**: The requirement to return the first page of results within 1000ms is challenging, particularly if there are many profiles to match and evaluate. As the dataset grows, achieving this real-time response for the first batch could become increasingly difficult.
- **Improvement**:
  - Implement **paging** or **lazy loading** to only retrieve a subset of profiles initially, using **precomputed match scores** stored in the database.
  - Use **caching** at various stages:
    - Cache frequently queried job requirements and profiles.
    - Cache match scores to speed up repeated queries, especially for jobs that remain active for longer periods.
  - Consider implementing **asynchronous loading** for results (i.e., provide a basic list first and then load additional results in the background).
  - Use **Redis** or **other in-memory caching** solutions to store intermediate results for high-frequency queries, further improving performance.

### 4. **Handling Dynamic Data (Profile Updates)**

- **Shortcoming**: Profiles and job requirements are expected to be dynamic (e.g., profiles are updated frequently, new skills or experience are added, etc.). Updating the match scores and recalculating the results in real-time might not always be feasible.
- **Improvement**:
  - Use **event-driven architecture** (e.g., **Kafka**, **RabbitMQ**) to trigger background jobs when profile data is updated (e.g., when new skills or experience are added). These jobs would recompute the match scores and update the `JobProfileMatch` table asynchronously.
  - Implement a **versioning system** for profiles and job requirements to track historical data, ensuring that outdated matches are not used to influence current results.

---
