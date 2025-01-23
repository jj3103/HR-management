-- CREATE TABLE wifedetails (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     personnel_id INT,
--     service_number VARCHAR(20),
--     name VARCHAR(255),
--     age INT,
--     occupation VARCHAR(255),
--     marriedSince DATE,
--     children INT,
--     FOREIGN KEY (personnel_id) REFERENCES personnel(personnel_id) ON DELETE CASCADE,
--     FOREIGN KEY (service_number) REFERENCES personnel(service_number) ON DELETE CASCADE
-- );


-- CREATE TABLE childdetails (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     personnel_id INT,
--     service_number VARCHAR(20),
--     name VARCHAR(255),
--     age INT,
--     gender VARCHAR(10),
--     FOREIGN KEY (personnel_id) REFERENCES personnel(personnel_id) ON DELETE CASCADE,
--     FOREIGN KEY (service_number) REFERENCES personnel(service_number) ON DELETE CASCADE
-- );


--     CREATE TABLE additionalpersonnel (
--         id INT AUTO_INCREMENT PRIMARY KEY,
--         service_number VARCHAR(20),
--         FOREIGN KEY (service_number) REFERENCES personnel(service_number) ON DELETE CASCADE
--     );

--     CREATE TABLE additionalwife (
--         id INT AUTO_INCREMENT PRIMARY KEY,
--         wife_id INT,
--         FOREIGN KEY (wife_id) REFERENCES wifedetails(wife_id) ON DELETE CASCADE
--     );

--   CREATE TABLE additionalchild (
--         id INT AUTO_INCREMENT PRIMARY KEY,
--         child_id INT,
--         FOREIGN KEY (child_id) REFERENCES childdetails(child_id) ON DELETE CASCADE
--     );

-- CREATE TABLE users(
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     email VARCHAR(255) UNIQUE,
--     password VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     role ENUM('admin','superadmin'),
--     service_number VARCHAR(20) UNIQUE,
--     status ENUM('active', 'desactive'),
--     FOREIGN KEY (service_number) REFERENCES personnel(service_number) ON DELETE CASCADE
-- );


-- CREATE TABLE attendance_summary (
--  id INT AUTO_INCREMENT PRIMARY KEY,
--     posted_count INT(11) NOT NULL DEFAULT 0,
--     absent_count INT(11) NOT NULL DEFAULT 0,
--     present_count INT(11) NOT NULL DEFAULT 0
-- );



-- CREATE TABLE personnel_promotion_requirements (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     rank VARCHAR(50) NOT NULL,
--     years_of_experience INT NOT NULL,
--     current_rank VARCHAR(50) NOT NULL,
--     remarks VARCHAR(255)
-- );

-- CREATE TABLE promotion_qualifications (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     promotion_requirement_id INT NOT NULL,
--     qualification_id INT NOT NULL,
--     FOREIGN KEY (promotion_requirement_id) REFERENCES personnel_promotion_requirements(id),
--     FOREIGN KEY (qualification_id) REFERENCES qualification(id)
-- );

-- CREATE TABLE promotion_courses (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     promotion_requirement_id INT NOT NULL,
--     course_id INT NOT NULL,
--     FOREIGN KEY (promotion_requirement_id) REFERENCES personnel_promotion_requirements(id),
--     FOREIGN KEY (course_id) REFERENCES courses(id)
-- );

-- CREATE TABLE bank_details (
--     bank_id INT(11) PRIMARY KEY AUTO_INCREMENT,
--     service_number VARCHAR(255),
--     personnel_id INT(11),
--     name VARCHAR(255),
--     single_ac_no INT NOT NULL,
--     single_ac_bank_name VARCHAR(255) NOT NULL,
--     joint_ac_no INT,
--     joint_ac_bank_name VARCHAR(255),
--     FOREIGN KEY (service_number) REFERENCES personnel(service_number) ON DELETE CASCADE ON UPDATE CASCADE
-- );


ALTER TABLE bank_details
ADD CONSTRAINT fk_service_number
FOREIGN KEY (service_number)
REFERENCES personnel(service_number);
