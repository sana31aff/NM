
import { config } from 'dotenv';
config();

import '@/ai/flows/energy-prediction-flow.ts';
import '@/ai/flows/model-optimization-suggestions.ts';
import '@/ai/flows/chatbot-flow.ts';
import '@/ai/flows/saving-tip-explanation-flow.ts'; // Added new flow
import '@/ai/flows/energy-report-flow.ts'; // Added new flow for report generator
import '@/ai/flows/model-training-simulation-flow.ts'; // Added new flow for training simulation
