# Test Reports & Documentation

This directory contains the full academic and practical QA engineering reports generated during the verification, validation, and performance testing phases of the Petstore API project.

### Reports Overview

- **[`api-and-performance-testing-report.pdf`](./api-and-performance-testing-report.pdf)** *(Original: `VVSprojekat3.pdf`)*  
  Comprehensive 87-page quality assurance report covering black-box test design (SauceDemo), UI test automation (Selenium IDE & NUnit C#), REST API functional test suites (Postman/Newman with 63 requests, 126 test scripts, and 366 assertions), and extensive performance testing comparing k6 (13,750 requests across smoke, load, stress, and spike stages) and Apache JMeter (1,510 requests across 4 thread groups with APDEX analysis).

- **[`whitebox-testing-and-refactoring-report.pdf`](./whitebox-testing-and-refactoring-report.pdf)** *(Original: `VVS.pdf`)*  
  Detailed 60-page white-box software testing and code quality report focusing on McCabe cyclomatic complexity, control flow graphs, branch/condition coverage, performance code tuning (optimizing collections, caching DateTime/Count, StringBuilder, LINQ replacement), and Martin Fowler-aligned code refactoring.
