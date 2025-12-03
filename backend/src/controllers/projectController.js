import Project from "../models/Project.js";

// Créer un projet
export const createProject = async (req, res) => {
  try {
    const { title, description, goalADA, deadline } = req.body;

    if (!title || !description || !goalADA || !deadline) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier si le user a déjà un projet financé
    const existingProject = await Project.findOne({ owner: req.user._id, status: "funded" });
    if (existingProject) {
      return res.status(400).json({ message: "Vous avez déjà bénéficié d'une levée de fonds" });
    }

    const project = await Project.create({
      title,
      description,
      goalADA,
      deadline,
      owner: req.user._id,
      status: "pending"
    });

    res.status(201).json({ message: "Projet créé", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Lister tous les projets
export const listProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("owner", "name email");
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Détails projet
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("owner", "name email");
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer un projet avec upload
export const createProjectWithFiles = async (req, res) => {
  try {
    const { title, description, goalADA, deadline } = req.body;

    if (!title || !description || !goalADA || !deadline) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const existingProject = await Project.findOne({ owner: req.user._id, status: "funded" });
    if (existingProject) {
      return res.status(400).json({ message: "Vous avez déjà bénéficié d'une levée de fonds" });
    }

    const project = await Project.create({
      title,
      description,
      goalADA,
      deadline,
      owner: req.user._id,
      status: "pending",
      imageUrl: req.files?.image?.[0]?.path,
      pdfUrl: req.files?.pdf?.[0]?.path,
    });

    res.status(201).json({ message: "Projet créé avec fichiers", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Approve par l’admin
export const approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    project.status = "published";
    await project.save();

    res.json({ message: "Projet approuvé", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export default {
  createProject,
  listProjects,
    getProject,
    createProjectWithFiles,
    approveProject
};

