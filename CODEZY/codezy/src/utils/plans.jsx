
export const plansData = [
  {
    name: "Basic Plan",
    type: "institution",
    price: 99,
    subtitle: "Perfect for small institutions getting started",
    features: ["Up to 100 students", "Basic Analytics", "Email Support", "5 Courses", "2 Teachers"],
    isRecommended: false,
  },
  {
    name: "Professional Plan",
    type: "institution",
    price: 299,
    subtitle: "Ideal for growing educational institutions",
    features: ["Up to 500 students", "Advanced Analytics", "Priority Support", "Unlimited Courses", "10 Teachers", "Custom Branding"],
    isRecommended: true,
  },
  {
    name: "Enterprise Plan",
    type: "institution",
    price: 799,
    subtitle: "Complete solution for large institutions",
    features: ["Unlimited students", "Full Analytics Suite", "24/7 Support", "Unlimited Courses", "Unlimited Teachers", "Custom Branding", "API Access", "Dedicated Account Manager"],
    isRecommended: false,
  },
  {
    name: "Solo Learner",
    type: "individual",
    price: 19,
    subtitle: "Perfect for self-learners",
    features: ["Access to 5 courses", "Community support", "Basic Analytics"],
    isRecommended: false,
  }
];

// Helper to get plan by name
export const getPlanByName = (name) => plansData.find(plan => plan.name === name) || plansData[0];
