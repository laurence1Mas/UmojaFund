import Project from "../models/Project.js";

// Lister tous les projets (admin)
export const listAllProjectsAdmin = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const filter = status ? { status } : {};
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(filter)
      .populate("owner", "name email")
      .skip(skip)
      .limit(limitNum);

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// Modifier le statut d’un projet
export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status: "published", "funded", "rejected"
    if (!status) return res.status(400).json({ message: "Statut requis" });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    project.status = status;
    await project.save();

    res.json({ message: "Statut projet mis à jour", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Rejeter un projet avec message d'explication
export const rejectProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body; // nouveau : message de rejet
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    project.status = "rejected";
    if (message) project.rejectionMessage = message; 
    await project.save();

    res.json({ message: "Projet rejeté", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export const getAdminStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const funded = await Project.countDocuments({ status: "funded" });
    const published = await Project.countDocuments({ status: "published" });
    const rejected = await Project.countDocuments({ status: "rejected" });

    const totalADA = await Project.aggregate([
      { $group: { _id: null, total: { $sum: "$totalContributions" } } }
    ]);

    res.json({ totalProjects, funded, published, rejected, totalADA: totalADA[0]?.total || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export default {
  listAllProjectsAdmin,
  updateProjectStatus,
  rejectProject,
  getAdminStats,
};

