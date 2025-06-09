const filterSensitiveFields = (user) => {
  if (!user) return null;
  let filteredUser=null;
  if(user.role==="coordinator"){
     filteredUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      country_code: user.country_code,
      provider: user.provider,
      role: user.role,
    };
  }else{
    filteredUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      country_code: user.country_code,
      provider: user.provider,
      role: user.role,
      profileImage: user.profileImage,
    };
  }
  
  return filteredUser;
};

const filterSensitiveFieldAdmin = (user) => {
  const filteredUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    country_code: user.country_code,
    provider: user.provider,
    role: user.role,
    is_varified: user.is_varified,
    created_by: user.created_by,
    updated_by: user.updated_by,
    created_at: user.created_at,
    updated_at: user.updated_at,
    is_active: user.is_active,
    is_deleted: user.is_deleted,
    profile_pic: user.profile_pic,
  };
  return filteredUser;
};

const filterSensitiveFieldsProfile = (user) => {
  if (!user) return null;
  let filteredUser=null;
  if(user.role==="coordinator"){
     filteredUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      country_code: user.country_code,
      provider: user.provider,
      role: user.role,
    };
  }else{
   filteredUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    country_code: user.country_code,
    provider: user.provider,
    role: user.role,
    profileImage: user.profileImage,
    cover_profile: user.cover_profile,
    education: user.education,
    experience: user.experience,
    headline: user.headline,
    biography: user.biography,
    language: user.language,
    website: user.website,
    social_links: user.social_links,
    skills: user.skills,
    license_certificate: user.license_certificate,
    user_location: user.user_location,
    reviews: user.reviews,
    total_learners: user.total_learners,
   }
  };
  return filteredUser;
};

module.exports = {
  filterSensitiveFields,
  filterSensitiveFieldAdmin,
  filterSensitiveFieldsProfile,
};
