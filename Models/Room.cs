using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace 数据库课程设计.Models
{
    [Table("Rooms")]
    public class Room
    {
        //主键
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RoomId { get; set; }
        [Required]
        public int BuildingId {  get; set; }

        [ForeignKey(nameof(BuildingId))]
        public virtual Building? Building { get; set; }
        [Required]
        public int FloorNumber {  get; set; }
        [Required]
        [MaxLength(20)]
        public string RoomNumber { get; set; } = string.Empty;

        [Required]
        public int Capacity { get; set; }

        [Required]
        public int AvailableBeds { get; set; }

        public int RoomType { get; set; } = 0; // 0-四人间，1-六人间，2-八人间
    }
}
