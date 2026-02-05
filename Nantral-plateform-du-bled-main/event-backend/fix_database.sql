
ALTER TABLE public.users 
ADD COLUMN email VARCHAR(255) UNIQUE;


-- Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'users' 
    AND table_schema = 'public'
ORDER BY 
    ordinal_position;

-- Voir tous les utilisateurs inscrits
SELECT * FROM public.users;
