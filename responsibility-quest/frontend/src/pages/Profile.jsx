import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Building2, 
  Shield, 
  Rocket,
  DollarSign,
  Clock,
  TrendingUp,
  Target,
  Wifi,
  Heart,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import useGameStore from '../store/gameStore';

const questions = [
  {
    id: 'employeeCount',
    title: 'How many employees?',
    subtitle: "Don't worry, this isn't a trick question",
    type: 'slider',
    options: [
      { value: 10, label: '1-10' },
      { value: 25, label: '11-25' },
      { value: 50, label: '26-50' },
      { value: 100, label: '51-100' },
      { value: 250, label: '100-250' },
      { value: 500, label: '250+' },
    ],
    janeComment: "Ah, {value} employees. That's approximately {value} potential password reset requests per week."
  },
  {
    id: 'locationCount',
    title: 'How many locations?',
    subtitle: 'Offices, warehouses, that one guy who works from a beach',
    type: 'stepper',
    min: 1,
    max: 50,
    janeComment: "{value} location{s}. That's {value} different ways for the network to have 'character'."
  },
  {
    id: 'hasRemoteWorkers',
    title: 'Do you have remote workers?',
    subtitle: 'People who attend meetings in pajama bottoms',
    type: 'toggle',
    janeComment: "{answer} remote work means {comment}."
  },
  {
    id: 'priorities',
    title: "What matters most to you?",
    subtitle: 'Pick your top 3 priorities',
    type: 'multiselect',
    max: 3,
    options: [
      { value: 'security', label: 'Security', icon: Shield, desc: 'Sleep well at night' },
      { value: 'innovation', label: 'Innovation', icon: Rocket, desc: 'Shiny new toys' },
      { value: 'budget', label: 'Budget', icon: DollarSign, desc: 'Every penny counts' },
      { value: 'uptime', label: 'Uptime', icon: Clock, desc: 'Always on' },
      { value: 'growth', label: 'Growth', icon: TrendingUp, desc: "We're scaling fast" },
      { value: 'compliance', label: 'Compliance', icon: Target, desc: 'Auditors love us' },
    ],
    janeComment: "Interesting choices. Let me pretend to write those down."
  },
  {
    id: 'industryTags',
    title: 'Any special requirements?',
    subtitle: 'Compliance frameworks and industry-specific needs',
    type: 'multiselect',
    max: 10,
    options: [
      { value: 'healthcare', label: 'Healthcare (HIPAA)', icon: Heart },
      { value: 'financial', label: 'Financial (PCI)', icon: DollarSign },
      { value: 'government', label: 'Government Contracts', icon: Building2 },
      { value: 'gdpr', label: 'EU Data (GDPR)', icon: Shield },
      { value: 'none', label: 'None of these', icon: HelpCircle },
    ],
    janeComment: "{selected} it is. Compliance is expensive to achieve, more expensive to ignore."
  },
  {
    id: 'currentSituation',
    title: 'How would you describe your current IT setup?',
    subtitle: 'Be honest—Jane has seen everything',
    type: 'select',
    options: [
      { value: 'dedicated', label: 'We have dedicated IT staff', desc: 'Living the dream' },
      { value: 'parttime', label: 'Someone wears the IT hat part-time', desc: 'The hero we need' },
      { value: 'password', label: 'IT? You mean the WiFi password person?', desc: 'Relatable' },
      { value: 'complicated', label: "It's complicated", desc: 'Jane: "It always is"' },
    ],
    janeComment: "Ah, {label}. {commentary}"
  },
];

const Profile = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { companyProfile, setCompanyProfile, saveCompanyProfile } = useGameStore();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [janeMessage, setJaneMessage] = useState('');
  
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  
  const getValue = () => companyProfile[question.id];
  
  const setValue = (value) => {
    setCompanyProfile({ [question.id]: value });
    
    // Generate Jane's comment
    let comment = question.janeComment || '';
    if (question.type === 'slider') {
      const option = question.options.find(o => o.value === value);
      comment = comment.replace('{value}', option?.label || value);
    } else if (question.type === 'stepper') {
      comment = comment.replace(/{value}/g, value).replace('{s}', value > 1 ? 's' : '');
    } else if (question.type === 'toggle') {
      comment = comment
        .replace('{answer}', value ? 'Having' : 'No')
        .replace('{comment}', value ? "VPN configs and 'can you hear me now?'" : 'everyone suffers together in the same building.');
    }
    setJaneMessage(comment);
  };
  
  const handleNext = async () => {
    if (isLastQuestion) {
      await saveCompanyProfile();
      navigate(`/play/${token}/path`);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setJaneMessage('');
    }
  };
  
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setJaneMessage('');
    }
  };
  
  const renderQuestion = () => {
    const value = getValue();
    
    switch (question.type) {
      case 'slider':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {question.options.map((option, i) => (
                <button
                  key={option.value}
                  onClick={() => setValue(option.value)}
                  className={`px-4 py-3 rounded-xl transition-all ${
                    value === option.value
                      ? 'bg-brand-orange text-white'
                      : 'bg-game-dark/50 text-gray-400 hover:text-white hover:bg-game-dark'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'stepper':
        return (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setValue(Math.max(question.min, (value || 1) - 1))}
              className="w-12 h-12 rounded-full bg-game-dark text-white text-2xl 
                         hover:bg-game-surface-light transition-colors"
            >
              -
            </button>
            <div className="text-center">
              <span className="text-6xl font-bold text-white">{value || 1}</span>
              <p className="text-gray-500 mt-1">location{(value || 1) > 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setValue(Math.min(question.max, (value || 1) + 1))}
              className="w-12 h-12 rounded-full bg-game-dark text-white text-2xl 
                         hover:bg-game-surface-light transition-colors"
            >
              +
            </button>
          </div>
        );
        
      case 'toggle':
        return (
          <div className="flex items-center justify-center gap-6">
            {[
              { val: false, label: 'Nope', icon: Building2 },
              { val: true, label: 'Yes!', icon: Wifi },
            ].map(option => (
              <button
                key={option.label}
                onClick={() => setValue(option.val)}
                className={`flex-1 max-w-[200px] p-6 rounded-2xl border-2 transition-all ${
                  value === option.val
                    ? 'border-brand-orange bg-brand-orange/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <option.icon 
                  className={`mx-auto mb-3 ${value === option.val ? 'text-brand-orange' : 'text-gray-400'}`} 
                  size={32} 
                />
                <p className="text-lg font-medium text-white">{option.label}</p>
              </button>
            ))}
          </div>
        );
        
      case 'multiselect':
        const selected = value || [];
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {question.options.map(option => {
              const isSelected = selected.includes(option.value);
              const Icon = option.icon;
              const atMax = question.max && selected.length >= question.max && !isSelected;
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (isSelected) {
                      setValue(selected.filter(v => v !== option.value));
                    } else if (!atMax) {
                      setValue([...selected, option.value]);
                    }
                  }}
                  disabled={atMax}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-brand-orange bg-brand-orange/10'
                      : atMax
                        ? 'border-white/5 opacity-50 cursor-not-allowed'
                        : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon 
                    className={`mb-2 ${isSelected ? 'text-brand-orange' : 'text-gray-400'}`} 
                    size={24} 
                  />
                  <p className="font-medium text-white text-sm">{option.label}</p>
                  {option.desc && (
                    <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                  )}
                </button>
              );
            })}
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-3">
            {question.options.map(option => (
              <button
                key={option.value}
                onClick={() => setValue(option.value)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                  value === option.value
                    ? 'border-brand-orange bg-brand-orange/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  value === option.value ? 'border-brand-orange' : 'border-gray-500'
                }`}>
                  {value === option.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{option.label}</p>
                  {option.desc && (
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Progress bar */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>
      
      {/* Question content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Question header */}
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  {question.title}
                </h2>
                <p className="text-gray-400">{question.subtitle}</p>
              </div>
              
              {/* Question input */}
              <div className="glass-card p-8 rounded-2xl">
                {renderQuestion()}
              </div>
              
              {/* Jane's comment */}
              <AnimatePresence>
                {janeMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center"
                  >
                    <p className="text-gray-400 italic">
                      Jane: "{janeMessage}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="max-w-2xl mx-auto w-full mt-8 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className="btn-ghost flex items-center gap-2 disabled:opacity-30"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        
        <button
          onClick={handleNext}
          className="btn-primary flex items-center gap-2"
        >
          {isLastQuestion ? 'Choose Your Path' : 'Next'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Profile;
