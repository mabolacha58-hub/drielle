import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export type ProfileData = {
  id: string;
  nome: string;
  email: string;
  role: 'profissional' | 'empresa' | 'admin';
  avatar_url?: string;
  titulo?: string;
  localizacao?: string;
  bio?: string;
  website?: string;
  telefone?: string;
  company_name?: string;
  created_at: string;
};

export type Skill = {
  id?: string;
  name: string;
};

export type Experience = {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
};

export type Education = {
  id?: string;
  degree: string;
  school: string;
  year: string;
  start_year?: string;
  end_year?: string;
};

export type Review = {
  id?: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_role: string;
  rating: number;
  comment: string;
  created_at: string;
};

export function useProfileData(profileId: string) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    connections: 0,
    profileViews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;

    fetchProfileData();
  }, [profileId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // For now, using mock data for other sections
      // In a real implementation, these would be separate tables
      if (profileData.role === 'profissional') {
        setSkills([
          { name: "React" },
          { name: "Node.js" },
          { name: "TypeScript" },
          { name: "PostgreSQL" },
          { name: "AWS" },
          { name: "Git" },
          { name: "Python" },
          { name: "MongoDB" }
        ]);

        setExperience([
          {
            role: "Engenheira de Software Sénior",
            company: "TechMoz",
            period: "Jan 2023 – Presente",
            description: "Liderança de uma equipa de 5 developers no desenvolvimento de plataformas B2B.",
            current: true
          },
          {
            role: "Developer Full Stack",
            company: "StartupMoz",
            period: "Mar 2021 – Dez 2022",
            description: "Desenvolvimento de aplicações web usando React e Node.js.",
            current: false
          },
        ]);

        setEducation([
          {
            degree: "Licenciatura em Engenharia Informática",
            school: "Universidade Eduardo Mondlane",
            year: "2016 – 2020"
          },
        ]);
      }

      // Mock reviews
      setReviews([
        {
          reviewer_id: "1",
          reviewer_name: "João Sitoe",
          reviewer_role: "Designer",
          rating: 5,
          comment: "Excelente profissional, muito competente e pontual.",
          created_at: new Date().toISOString()
        },
        {
          reviewer_id: "2",
          reviewer_name: "BCI Banco",
          reviewer_role: "Cliente",
          rating: 5,
          comment: "Entregou o projecto dentro do prazo e superou as expectativas.",
          created_at: new Date().toISOString()
        },
      ]);

      // Mock stats
      setStats({
        connections: 142,
        profileViews: 328,
        averageRating: 5.0,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao actualizar perfil');
    }
  };

  return {
    profile,
    skills,
    experience,
    education,
    reviews,
    stats,
    loading,
    error,
    updateProfile,
    refetch: fetchProfileData,
  };
}