import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Video,
      title: 'HD Video Calls',
      description: 'Crystal clear video quality for professional meetings'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Connect with your team from anywhere in the world'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'End-to-end encryption keeps your meetings safe'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Video
            <span className="text-blue-500"> Meetings</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connect, collaborate, and communicate with your team through secure, 
            high-quality video meetings designed for modern professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button
              size="lg"
              onClick={() => navigate('/lobby')}
              className="text-lg px-8 py-4"
            >
              Join Meeting
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/lobby?create=true')}
              className="text-lg px-8 py-4"
            >
              Create Meeting
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <feature.icon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;