using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace 数据库课程设计.Models
{
    [Table("Buildings")]
    public class Building
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BuildingId { get; set; }

        [Required]
        [MaxLength(50)]
        public string BuildingName { get; set; } = string.Empty;

        [Required]
        public int TotalFloors { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? ManagerName { get; set; }

        [MaxLength(20)]
        public string? ManagerPhone { get; set; }

    }
}
