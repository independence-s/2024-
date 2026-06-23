using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace 数据库课程设计.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(256)]
        public string PasswordHash { get; set; } = string.Empty;

        public int Role { get; set; } = 0; // 0-学生，1-宿管，2-管理员

        public int? StudentId { get; set; } // 关联学生（学生角色时非空）

        [ForeignKey(nameof(StudentId))]
        public virtual Student? Student { get; set; }

        public bool IsActive { get; set; } = true;
    }
}