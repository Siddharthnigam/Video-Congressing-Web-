import { Eye, Users, Shield, Award, Target, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About VideoMeet Pro
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Revolutionizing video conferencing with AI-powered attention detection and professional collaboration tools
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe that effective communication is the foundation of successful collaboration. 
                VideoMeet Pro was created to address the challenges of remote meetings by ensuring 
                participants stay engaged and focused throughout their sessions.
              </p>
              <p className="text-lg text-gray-600">
                Our innovative attention detection technology helps hosts monitor participant engagement 
                while providing gentle reminders to keep everyone on track, making virtual meetings 
                as effective as in-person gatherings.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Focus</h3>
                <p className="text-gray-600">Keeping meetings productive and engaging</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Care</h3>
                <p className="text-gray-600">Supporting better communication</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-600">Delivering professional-grade solutions</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg text-center">
                <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600">Protecting your privacy and data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-600">
              Advanced technology meets intuitive design
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Eye className="h-16 w-16 text-blue-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Attention Detection</h3>
              <p className="text-gray-600 mb-4">
                Our proprietary algorithm uses computer vision to monitor participant engagement in real-time.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Face detection and tracking</li>
                <li>• Eye movement analysis</li>
                <li>• Distraction alerts</li>
                <li>• Host monitoring dashboard</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Users className="h-16 w-16 text-green-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Collaboration</h3>
              <p className="text-gray-600 mb-4">
                Designed for seamless teamwork with intelligent features that adapt to your needs.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Dynamic video layouts</li>
                <li>• Real-time chat integration</li>
                <li>• Screen sharing capabilities</li>
                <li>• Participant management</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Shield className="h-16 w-16 text-purple-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Security</h3>
              <p className="text-gray-600 mb-4">
                Built with security-first principles to protect your sensitive communications.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• End-to-end encryption</li>
                <li>• Secure room access</li>
                <li>• Privacy-focused design</li>
                <li>• GDPR compliant</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Passionate developers creating the future of video communication
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">SJ</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Siddharth Nigam</h3>
              <p className="text-blue-600 font-semibold mb-4">Lead Developer</p>
              <p className="text-gray-600 mb-6">
                Full-stack developer passionate about creating innovative solutions for better communication and collaboration.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📧 siddharthjinigam@gmail.com</p>
                <p>📱 9098613462</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
