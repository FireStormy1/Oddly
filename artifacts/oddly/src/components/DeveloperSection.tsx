import { motion } from "framer-motion";

const skills = ["React", "TypeScript", "Node.js", "Firebase", "Socket.io", "Python", "TailwindCSS", "MongoDB"];
const projects = [
  { name: "Oddly", desc: "Real-time multiplayer social deduction word game" },
  { name: "DevConnect", desc: "Developer collaboration and project matching platform" },
  { name: "StudySync", desc: "Collaborative study rooms with real-time whiteboard" },
];

export default function DeveloperSection() {
  return (
    <div className="py-8 flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A855F7]"
      >
        The Developer
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[#94A3B8] text-center mb-10"
      >
        The mind behind Oddly
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-2xl bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(124,58,237,0.1)]"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
      >
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] flex-shrink-0">
            SD
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-black text-white">Saswat Dixit</h3>
            <p className="text-primary font-semibold">B.Tech CSE</p>
            <p className="text-[#94A3B8] text-sm">Silicon University</p>
          </div>
        </div>

        {/* About Me */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">About Me</h4>
          <p className="text-[#94A3B8] text-sm leading-relaxed">
            A passionate Computer Science student with a love for building real-time, interactive applications. I enjoy creating games and tools that bring people together, combining clean code with engaging user experiences.
          </p>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="px-3 py-1.5 text-xs font-medium bg-primary/10 border border-primary/20 text-primary rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-8">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Projects</h4>
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.name} className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="font-semibold text-white text-sm">{project.name}</p>
                <p className="text-[#94A3B8] text-xs">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Connect</h4>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "LinkedIn", href: "#" },
              { label: "GitHub", href: "#" },
              { label: "Email", href: "mailto:saswat@example.com" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
